/* 数据分析 */
window.Views = window.Views || {};

Views.analytics = {
  range: '14d',

  render(container) {
    container.innerHTML = `
      <div class="page-head">
        <div>
          <div class="page-title">数据分析</div>
          <div class="page-desc">客户反馈汇总：送达、打开、点击、回复、退信全链路指标分析</div>
        </div>
        <div class="page-head__actions">
          <select class="select" style="width:150px" id="rangeSel">
            <option value="7d">近 7 天</option>
            <option value="14d" selected>近 14 天</option>
            <option value="30d">近 30 天</option>
          </select>
          <button class="btn btn--ghost" id="exportReport">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            导出报表
          </button>
        </div>
      </div>

      <div id="analyticsBody" style="position:relative"></div>`;

    document.getElementById('rangeSel').addEventListener('change', async e => {
      this.range = e.target.value;
      const body = document.getElementById('analyticsBody');
      body.innerHTML = '<div class="loading-mask"><div class="spinner"></div></div>';
      await mockApi(null, 600);
      this.draw(body);
    });
    document.getElementById('exportReport').addEventListener('click', () => {
      UI.downloadCSV('邮件数据分析报表.csv', [
        ['日期', '发送量', '打开量', '回复量'],
        ...Store.state.trend.map(d => [d.date, d.sent, d.opened, d.replied])
      ]);
      UI.toast('数据分析报表已导出（CSV）', 'success');
    });

    this.draw(document.getElementById('analyticsBody'));
  },

  draw(el) {
    const s = Store.state;
    let days = s.trend;
    if (this.range === '7d') {
      days = s.trend.slice(-7);
    } else if (this.range === '30d') {
      const out = [];
      const base = new Date('2026-09-03');
      for (let i = 29; i >= 0; i--) {
        const d = new Date(base); d.setDate(d.getDate() - i);
        const src = s.trend[i % s.trend.length];
        out.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, sent: src.sent, opened: src.opened, replied: src.replied });
      }
      days = out;
    }
    const cmps = s.campaigns;
    const t = cmps.reduce((a, c) => { ['sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced'].forEach(k => a[k] += c[k]); return a; },
      { sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0, bounced: 0 });

    const kpis = [
      ['送达率', UI.pct(t.delivered, t.sent) + '%', '成功送达 ' + t.delivered.toLocaleString(), 'ic-green', '↑ 1.2%'],
      ['打开率', UI.pct(t.opened, t.delivered) + '%', t.opened.toLocaleString() + ' 人打开', 'ic-sky', '↑ 4.8%'],
      ['回复率', UI.pct(t.replied, t.delivered) + '%', t.replied.toLocaleString() + ' 人回复', 'ic-amber', '↑ 2.1%'],
      ['退信率', UI.pct(t.bounced, t.sent) + '%', t.bounced + ' 封退信', 'ic-red', '↓ 0.6%']
    ];

    el.innerHTML = `
      <div class="grid grid-4 mb-16">
        ${kpis.map(([l, v, foot, cls, trend]) => `
          <div class="card kpi">
            <div class="kpi__top"><span class="kpi__label">${l}</span><span class="kpi__icon ${cls}">●</span></div>
            <div class="kpi__value">${v}</div>
            <div class="kpi__foot"><span class="kpi__trend ${trend.includes('↑') ? 'trend-up' : 'trend-down'}">${trend}</span> ${foot}</div>
          </div>`).join('')}
      </div>

      <div class="card mb-16">
        <div class="card__head">
          <div class="card__title">
            <svg viewBox="0 0 24 24" width="17" height="17"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            发送 / 打开 / 回复趋势
          </div>
          <div id="lineLegend"></div>
        </div>
        <div class="card__body" id="lineChart"></div>
      </div>

      <div class="grid grid-2 mb-16">
        <div class="card">
          <div class="card__head"><div class="card__title">客户反馈状态分布</div></div>
          <div class="card__body" id="fbDonut"></div>
        </div>
        <div class="card">
          <div class="card__head"><div class="card__title">各任务回复率对比</div></div>
          <div class="card__body" id="cmpBars"></div>
        </div>
      </div>

      <div class="card">
        <div class="card__head"><div class="card__title">客户反馈汇总</div></div>
        <div class="card__body">
          <div class="grid grid-3">
            <div class="stat-line"><span class="sl-label"><span class="badge badge--green">回复</span> 客户主动回复</span><span class="sl-value">${t.replied}</span></div>
            <div class="stat-line"><span class="sl-label"><span class="badge badge--indigo">点击</span> 点击邮件链接</span><span class="sl-value">${t.clicked}</span></div>
            <div class="stat-line"><span class="sl-label"><span class="badge badge--blue">打开</span> 已打开未回复</span><span class="sl-value">${Math.max(0, t.opened - t.clicked)}</span></div>
            <div class="stat-line"><span class="sl-label"><span class="badge badge--gray">未读</span> 送达后未打开</span><span class="sl-value">${Math.max(0, t.delivered - t.opened)}</span></div>
            <div class="stat-line"><span class="sl-label"><span class="badge badge--red">退信</span> 地址无效/拒收</span><span class="sl-value">${t.bounced}</span></div>
            <div class="stat-line"><span class="sl-label"><span class="badge badge--amber">发送中</span> 队列待发送</span><span class="sl-value">${t.sent - t.delivered}</span></div>
          </div>
        </div>
      </div>`;

    document.getElementById('lineChart').innerHTML = Charts.line(days, [
      { key: 'sent', name: '发送', color: '#6366f1' },
      { key: 'opened', name: '打开', color: '#0ea5e9' },
      { key: 'replied', name: '回复', color: '#f59e0b' }
    ]);
    document.getElementById('lineLegend').innerHTML = Charts.legend([
      { name: '发送量', color: '#6366f1' },
      { name: '打开量', color: '#0ea5e9' },
      { name: '回复量', color: '#f59e0b' }
    ]);

    const segs = [
      { value: t.replied, color: '#16a34a', label: '已回复' },
      { value: t.clicked, color: '#8b5cf6', label: '已点击' },
      { value: Math.max(0, t.opened - t.clicked), color: '#0ea5e9', label: '已打开' },
      { value: Math.max(0, t.delivered - t.opened), color: '#cbd5e1', label: '未打开' },
      { value: t.bounced, color: '#dc2626', label: '退信' }
    ];
    document.getElementById('fbDonut').innerHTML =
      Charts.donut(segs, { size: 190, center: { value: t.sent.toLocaleString(), label: '总发送' } }) +
      Charts.donutLegend(segs, t.sent);

    const barData = cmps.filter(c => c.status !== 'draft').map(c => ({
      label: c.name.length > 8 ? c.name.slice(0, 7) + '…' : c.name,
      value: c.delivered ? +(UI.pct(c.replied, c.delivered)) : 0,
      display: c.delivered ? UI.pct(c.replied, c.delivered) + '%' : '0%',
      color: c.status === 'completed' ? '#6366f1' : '#22c55e'
    }));
    document.getElementById('cmpBars').innerHTML = Charts.bars(barData);
  }
};
