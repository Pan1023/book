/* 数据看板 */
window.Views = window.Views || {};

Views.dashboard = {
  render(container) {
    const s = Store.state;
    const cmps = s.campaigns;
    const totalSent = cmps.reduce((a, c) => a + c.sent, 0);
    const totalDeliv = cmps.reduce((a, c) => a + c.delivered, 0);
    const totalOpen = cmps.reduce((a, c) => a + c.opened, 0);
    const totalReply = cmps.reduce((a, c) => a + c.replied, 0);
    const hotLeads = (s.leads || []).filter(l => l.level === '高意向').length;

    const kpis = [
      { label: '本月累计发送', value: totalSent.toLocaleString(), trend: '+12.5%', up: true, icon: 'send', cls: 'ic-indigo',
        svg: '<svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' },
      { label: '平均送达率', value: UI.pct(totalDeliv, totalSent) + '%', trend: '+1.2%', up: true, icon: 'check', cls: 'ic-green',
        svg: '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' },
      { label: '平均打开率', value: UI.pct(totalOpen, totalDeliv) + '%', trend: '+4.8%', up: true, icon: 'eye', cls: 'ic-sky',
        svg: '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' },
      { label: '高意向客户', value: hotLeads + ' 位', trend: '+2 位', up: true, icon: 'star', cls: 'ic-amber',
        svg: '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' }
    ];

    // 转化漏斗
    const funnel = [
      { label: '发送', value: totalSent, color: '#6366f1' },
      { label: '送达', value: totalDeliv, color: '#0ea5e9' },
      { label: '打开', value: totalOpen, color: '#22c55e' },
      { label: '回复', value: totalReply, color: '#f59e0b' }
    ];
    const funnelHTML = funnel.map((f, i) => {
      const w = Math.max(12, (f.value / funnel[0].value) * 100);
      const pct = i === 0 ? '100%' : UI.pct(f.value, funnel[i - 1].value) + '%';
      return `<div class="funnel-row">
        <div class="funnel-row__label">${f.label}</div>
        <div class="funnel-row__track">
          <div class="funnel-row__fill" style="width:${w}%;background:${f.color}">${f.value.toLocaleString()}</div>
        </div>
        <div class="funnel-row__pct">${pct}</div>
      </div>`;
    }).join('');

    // 最近任务
    const recentCmp = cmps.slice(0, 4).map(c => {
      const st = CAMPAIGN_STATUS[c.status];
      return `<div class="stat-line">
        <div class="sl-label">
          <span class="badge ${st.badge}">${st.label}</span>
          <a href="#/campaigns/${c.id}" style="color:var(--text-1);font-weight:600">${c.name}</a>
        </div>
        <div class="sl-value">${c.sent}/${c.total}</div>
      </div>`;
    }).join('');

    // 活动流
    const actHTML = s.activities.map(a => `
      <div class="activity">
        <div class="activity__icon ${a.color}">
          <svg viewBox="0 0 24 24">${iconPath(a.icon)}</svg>
        </div>
        <div>
          <div class="activity__text">${a.text}</div>
          <div class="activity__time">${a.time}</div>
        </div>
      </div>`).join('');

    // Top 意向客户
    const topLeads = (s.leads || []).slice().sort((a, b) => b.score - a.score).slice(0, 5).map(l => `
      <div class="stat-line">
        <div class="sl-label">
          <span class="avatar avatar--sm ${l.avatar}">${UI.initial(l.name)}</span>
          <div>
            <div style="font-weight:600;color:var(--text-1)">${l.name} <span style="color:var(--text-3);font-weight:400;font-size:12px">${l.company}</span></div>
            <div style="font-size:11.5px;color:var(--text-3)">${l.keywords.slice(0, 2).join(' · ')}</div>
          </div>
        </div>
        <div class="sl-value" style="color:${l.score >= 80 ? 'var(--success)' : l.score >= 50 ? 'var(--warning)' : 'var(--text-3)'}">${l.score} 分</div>
      </div>`).join('');

    container.innerHTML = `
      <div class="page-head">
        <div>
          <div class="page-title">数据看板</div>
          <div class="page-desc">邮件发送与客户互动的整体概览 · 数据更新至 2026-09-03</div>
        </div>
        <div class="page-head__actions">
          <button class="btn btn--ghost" id="dashReset">
            <svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            重置演示数据
          </button>
          <button class="btn btn--primary" onclick="location.hash='#/campaigns/new'">
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            创建邮件任务
          </button>
        </div>
      </div>

      <div class="grid grid-4 mb-16">
        ${kpis.map(k => `
          <div class="card kpi">
            <div class="kpi__top">
              <span class="kpi__label">${k.label}</span>
              <span class="kpi__icon ${k.cls}">${k.svg}</span>
            </div>
            <div class="kpi__value">${k.value}</div>
            <div class="kpi__foot">
              <span class="kpi__trend ${k.up ? 'trend-up' : 'trend-down'}">${k.up ? '↑' : '↓'} ${k.trend}</span>
              较上月
            </div>
          </div>`).join('')}
      </div>

      <div class="grid grid-2-1 mb-16">
        <div class="card">
          <div class="card__head">
            <div class="card__title">
              <svg viewBox="0 0 24 24" width="17" height="17"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              近 14 天邮件趋势
            </div>
            <a href="#/analytics" class="btn btn--ghost btn--sm">查看完整分析</a>
          </div>
          <div class="card__body">
            <div id="trendChart"></div>
            <div id="trendLegend"></div>
          </div>
        </div>
        <div class="card">
          <div class="card__head"><div class="card__title">发送转化漏斗</div></div>
          <div class="card__body"><div class="funnel">${funnelHTML}</div></div>
        </div>
      </div>

      <div class="grid grid-3">
        <div class="card">
          <div class="card__head">
            <div class="card__title">最近邮件任务</div>
            <a href="#/campaigns" class="tag tag--indigo" style="cursor:pointer">全部 →</a>
          </div>
          <div class="card__body" style="padding-top:8px;padding-bottom:8px">${recentCmp}</div>
        </div>
        <div class="card">
          <div class="card__head">
            <div class="card__title">最新动态</div>
          </div>
          <div class="card__body" style="padding-top:4px">${actHTML}</div>
        </div>
        <div class="card">
          <div class="card__head">
            <div class="card__title">意向客户 TOP 5</div>
            <a href="#/leads" class="tag tag--gold" style="cursor:pointer">全部 →</a>
          </div>
          <div class="card__body" style="padding-top:8px;padding-bottom:8px">${topLeads}</div>
        </div>
      </div>`;

    // 折线图
    document.getElementById('trendChart').innerHTML = Charts.line(s.trend, [
      { key: 'sent', name: '发送', color: '#6366f1' },
      { key: 'opened', name: '打开', color: '#0ea5e9' },
      { key: 'replied', name: '回复', color: '#f59e0b' }
    ]);
    document.getElementById('trendLegend').innerHTML = Charts.legend([
      { name: '发送量', color: '#6366f1' },
      { name: '打开量', color: '#0ea5e9' },
      { name: '回复量', color: '#f59e0b' }
    ]);

    document.getElementById('dashReset').addEventListener('click', () => {
      UI.confirm('重置演示数据', '将清除你在 Demo 中产生的所有操作记录（已发送邮件、新建任务、账号变更等），恢复为初始演示数据。', () => {
        Store.reset();
        UI.toast('演示数据已重置', 'success');
        App.navigate('dashboard');
      }, '确认重置', true);
    });
  }
};

/* 活动/通知图标 path */
function iconPath(name) {
  const paths = {
    reply: '<polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>',
    send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    bounce: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
    warn: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    click: '<path d="M9 9l5 12 1.8-5.2L21 14z"/><path d="M7.2 2.2 8 5.1"/><path d="M5.1 8l-2.9-.8"/><path d="M14 4.1 12 6"/><path d="m6 12-1.9 2"/>'
  };
  return paths[name] || paths.star;
}
