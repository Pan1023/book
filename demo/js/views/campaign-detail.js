/* 任务详情 · 发送追踪 */
window.Views = window.Views || {};

Views['campaign-detail'] = {
  recipientFilter: 'all',

  render(container, params) {
    const c = Store.getCampaign(params.id);
    if (!c) {
      container.innerHTML = '<div class="empty"><div class="empty__title">任务不存在</div><a class="btn btn--primary" href="#/campaigns">返回任务列表</a></div>';
      return;
    }
    const st = CAMPAIGN_STATUS[c.status];
    const recipients = MOCK.recipients; // 演示：任务收件人明细复用统一模拟明细

    container.innerHTML = `
      <div class="page-head">
        <div>
          <a href="#/campaigns" style="font-size:13px;color:var(--primary);display:inline-flex;align-items:center;gap:4px;margin-bottom:6px">
            <svg viewBox="0 0 24 24" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg> 返回任务列表
          </a>
          <div class="page-title" style="display:flex;align-items:center;gap:10px">
            ${c.name}
            <span class="badge ${st.badge}" id="detailStatusBadge">${st.label}</span>
          </div>
          <div class="page-desc">创建于 ${c.createdAt} · 计划发送 ${c.scheduleAt || '—'} · 发件账号 ${UI.accountLabel(c.fromAccount)}</div>
        </div>
        <div class="page-head__actions">
          ${c.status === 'scheduled' ? '<button class="btn btn--ghost" id="cancelSchedule"><svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> 取消定时</button>' : ''}
          <button class="btn btn--ghost" id="retryBounced">
            <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            重发退信地址
          </button>
          <button class="btn btn--primary" onclick="location.hash='#/leads'">查看意向客户 →</button>
        </div>
      </div>

      <div class="grid grid-4 mb-16" id="detailKpis">${this.kpisHTML(c)}</div>

      <div class="grid grid-2-1 mb-16">
        <div class="card">
          <div class="card__head"><div class="card__title">发送转化漏斗</div></div>
          <div class="card__body" id="detailFunnel">${this.funnelHTML(c)}</div>
        </div>
        <div class="card">
          <div class="card__head"><div class="card__title">收件人状态分布</div></div>
          <div class="card__body" id="donutBox">${this.donutHTML(c)}</div>
        </div>
      </div>

      <div class="card">
        <div class="toolbar">
          ${[['all', '全部'], ['replied', '已回复'], ['clicked', '已点击'], ['opened', '已打开'], ['delivered', '已送达'], ['bounced', '退信'], ['pending', '待发送']]
            .map(([k, label]) => `<button class="filter-chip ${this.recipientFilter === k ? 'active' : ''}" data-rf="${k}">${label}</button>`).join('')}
          <div class="spacer"></div>
          <button class="btn btn--ghost btn--sm" id="exportRecipients">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            导出明细
          </button>
        </div>
        <div class="table-wrap" id="recipientTable" style="position:relative"></div>
      </div>`;

    const tableEl = document.getElementById('recipientTable');
    const drawTable = () => {
      const list = recipients.filter(r => this.recipientFilter === 'all' || r.status === this.recipientFilter);
      tableEl.innerHTML = `
        <table class="tbl">
          <thead><tr><th>收件人</th><th>公司</th><th>邮箱</th><th>状态</th><th>打开次数</th><th>最近事件</th><th>操作</th></tr></thead>
          <tbody>
            ${list.map(r => {
              const st = RECIPIENT_STATUS[r.status];
              return `<tr>
                <td><div style="display:flex;align-items:center;gap:10px"><span class="avatar avatar--sm ${UI.avatarColor(r.name)}">${UI.initial(r.name)}</span><b>${r.name}</b></div></td>
                <td class="muted">${r.company}</td>
                <td class="muted" style="font-size:12.5px">${r.email}</td>
                <td><span class="badge ${st.badge}">${st.label}</span></td>
                <td>${r.openCount > 0 ? `<b>${r.openCount}</b>` : '<span class="muted">—</span>'}</td>
                <td class="muted" style="font-size:12.5px">${r.lastEvent}</td>
                <td>
                  <button class="btn btn--ghost btn--sm" data-mailto="${r.email}">发邮件</button>
                  ${r.status === 'replied' ? '<span class="tag tag--gold">高意向</span>' : ''}
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        ${!list.length ? '<div class="empty"><div class="empty__title">该状态下暂无收件人</div></div>' : ''}`;

      tableEl.querySelectorAll('[data-mailto]').forEach(b =>
        b.addEventListener('click', () => openComposeModal({ to: b.dataset.mailto })));
    };
    drawTable();

    container.querySelectorAll('[data-rf]').forEach(b =>
      b.addEventListener('click', () => { this.recipientFilter = b.dataset.rf; container.querySelectorAll('[data-rf]').forEach(x => x.classList.toggle('active', x === b)); drawTable(); }));

    document.getElementById('retryBounced').addEventListener('click', () => {
      const n = recipients.filter(r => r.status === 'bounced').length;
      UI.toast(n ? `已将 ${n} 个退信地址加入重试队列（模拟）` : '当前没有需要重试的退信地址', n ? 'success' : 'info');
    });
    document.getElementById('exportRecipients').addEventListener('click', () => {
      const list = recipients.filter(r => this.recipientFilter === 'all' || r.status === this.recipientFilter);
      UI.downloadCSV(`任务明细_${c.name.slice(0, 10)}.csv`, [
        ['姓名', '邮箱', '公司', '状态', '打开次数', '最近事件'],
        ...list.map(r => [r.name, r.email, r.company, RECIPIENT_STATUS[r.status].label, r.openCount, r.lastEvent])
      ]);
      UI.toast(`已导出 ${list.length} 条收件人明细`, 'success');
    });
    const cancelBtn = document.getElementById('cancelSchedule');
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
      UI.confirm('取消定时发送', `确认取消任务《${c.name}》的定时计划？任务将保存为草稿。`, () => {
        Store.updateCampaign(c.id, { status: 'draft' });
        UI.toast('定时已取消，任务保存为草稿', 'success');
        App.rerender();
      }, '确认取消', true);
    });
  },

  /* ---------- 局部 HTML 构造（供实时刷新复用） ---------- */
  kpisHTML(c) {
    return [
      ['发送进度', c.progress + '%', 'ic-indigo', `${c.sent.toLocaleString()} / ${c.total.toLocaleString()} 封`],
      ['送达率', c.sent ? UI.pct(c.delivered, c.sent) + '%' : '—', 'ic-green', `${c.bounced} 封退信`],
      ['打开率', c.delivered ? UI.pct(c.opened, c.delivered) + '%' : '—', 'ic-sky', `${c.opened} 人打开`],
      ['回复率', c.delivered ? UI.pct(c.replied, c.delivered) + '%' : '—', 'ic-amber', `${c.replied} 人回复`]
    ].map(([l, v, cls, foot]) => `
      <div class="card kpi">
        <div class="kpi__top"><span class="kpi__label">${l}</span><span class="kpi__icon ${cls}">●</span></div>
        <div class="kpi__value">${v}</div>
        <div class="kpi__foot">${foot}</div>
      </div>`).join('');
  },

  funnelHTML(c) {
    if (c.delivered === 0) {
      return `<div class="empty"><div class="empty__title">任务尚未开始发送</div><div class="empty__desc">${c.status === 'scheduled' ? '到达计划时间后自动开始发送' : '发送后这里将展示实时转化数据'}</div></div>`;
    }
    const rows = [['发送', c.sent, '#6366f1'], ['送达', c.delivered, '#0ea5e9'], ['打开', c.opened, '#22c55e'], ['点击', c.clicked, '#8b5cf6'], ['回复', c.replied, '#f59e0b']];
    return `<div class="funnel">${rows.map(([label, v, color], i) => {
      const w = Math.max(8, (v / rows[0][1]) * 100);
      const rate = i === 0 ? '100%' : UI.pct(v, rows[i - 1][1]) + '%';
      return `<div class="funnel-row"><div class="funnel-row__label">${label}</div>
        <div class="funnel-row__track"><div class="funnel-row__fill" style="width:${w}%;background:${color}">${v.toLocaleString()}</div></div>
        <div class="funnel-row__pct">${rate}</div></div>`;
    }).join('')}</div>`;
  },

  donutHTML(c) {
    if (c.delivered === 0) return '<div class="empty" style="padding:30px"><div class="empty__desc">暂无数据</div></div>';
    const segs = [
      { value: c.replied, color: '#16a34a', label: '已回复' },
      { value: Math.max(0, c.clicked - c.replied), color: '#8b5cf6', label: '已点击' },
      { value: Math.max(0, c.opened - c.clicked), color: '#0ea5e9', label: '已打开' },
      { value: Math.max(0, c.delivered - c.opened), color: '#cbd5e1', label: '已送达未读' },
      { value: c.bounced, color: '#dc2626', label: '退信' }
    ].filter(x => x.value > 0);
    return Charts.donut(segs, { size: 170, center: { value: c.total.toLocaleString(), label: '总收件人' } }) + Charts.donutLegend(segs, c.total);
  },

  /* 实时刷新（仅更新统计区域，不重绘表格与筛选状态） */
  refreshRealtime(id) {
    const c = Store.getCampaign(id);
    if (!c) return;
    const badge = document.getElementById('detailStatusBadge');
    if (badge) { const st = CAMPAIGN_STATUS[c.status]; badge.className = 'badge ' + st.badge; badge.textContent = st.label; }
    const kpis = document.getElementById('detailKpis');
    if (kpis) kpis.innerHTML = this.kpisHTML(c);
    const funnel = document.getElementById('detailFunnel');
    if (funnel) funnel.innerHTML = this.funnelHTML(c);
    const donut = document.getElementById('donutBox');
    if (donut) donut.innerHTML = this.donutHTML(c);
  }
};
