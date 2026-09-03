/* 意向客户提取 */
window.Views = window.Views || {};

Views.leads = {
  level: 'all',
  keyword: '',

  render(container) {
    const leads = Store.state.leads || MOCK.leads;
    const high = leads.filter(l => l.level === '高意向').length;
    const mid = leads.filter(l => l.level === '中意向').length;

    container.innerHTML = `
      <div class="page-head">
        <div>
          <div class="page-title">意向客户提取</div>
          <div class="page-desc">基于回复速度、内容关键词、互动频率等维度的智能评分，自动标记高意向客户</div>
        </div>
        <div class="page-head__actions">
          <button class="btn btn--ghost" id="ruleBtn">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            评分规则
          </button>
          <button class="btn btn--primary" id="exportLeads">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            导出客户（CSV / Excel）
          </button>
        </div>
      </div>

      <div class="grid grid-4 mb-16">
        <div class="card kpi">
          <div class="kpi__top"><span class="kpi__label">高意向客户</span><span class="kpi__icon ic-green"><svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span></div>
          <div class="kpi__value">${high}</div>
          <div class="kpi__foot">评分 ≥ 80，建议优先跟进</div>
        </div>
        <div class="card kpi">
          <div class="kpi__top"><span class="kpi__label">中意向客户</span><span class="kpi__icon ic-amber"><svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/></svg></span></div>
          <div class="kpi__value">${mid}</div>
          <div class="kpi__foot">评分 50–79，持续培育</div>
        </div>
        <div class="card kpi">
          <div class="kpi__top"><span class="kpi__label">本周新增意向</span><span class="kpi__icon ic-indigo"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></span></div>
          <div class="kpi__value">3</div>
          <div class="kpi__foot"><span class="kpi__trend trend-up">↑ 自动标记</span></div>
        </div>
        <div class="card kpi">
          <div class="kpi__top"><span class="kpi__label">平均意向分</span><span class="kpi__icon ic-sky"><svg viewBox="0 0 24 24"><path d="M3 3v18h18"/></svg></span></div>
          <div class="kpi__value">${Math.round(leads.reduce((a, l) => a + l.score, 0) / leads.length)}</div>
          <div class="kpi__foot">较上周 <span class="kpi__trend trend-up">↑ 6 分</span></div>
        </div>
      </div>

      <div class="card">
        <div class="toolbar">
          <button class="filter-chip ${this.level === 'all' ? 'active' : ''}" data-lv="all">全部 (${leads.length})</button>
          <button class="filter-chip ${this.level === '高意向' ? 'active' : ''}" data-lv="高意向">🔥 高意向 (${high})</button>
          <button class="filter-chip ${this.level === '中意向' ? 'active' : ''}" data-lv="中意向">中意向 (${mid})</button>
          <button class="filter-chip ${this.level === '低意向' ? 'active' : ''}" data-lv="低意向">低意向</button>
          <button class="filter-chip ${this.level === '无效' ? 'active' : ''}" data-lv="无效">无效/退信</button>
          <div class="spacer"></div>
          <div class="search-box">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="leadSearch" placeholder="搜索客户 / 公司 / 关键词…" value="${this.keyword}"/>
          </div>
        </div>
        <div class="table-wrap">
          <table class="tbl">
            <thead><tr>
              <th>客户</th><th>意向评分</th><th>等级</th><th>回复速度</th>
              <th>意向关键词</th><th>互动摘要</th><th>来源任务</th><th style="width:110px">操作</th>
            </tr></thead>
            <tbody id="leadTbody"></tbody>
          </table>
        </div>
      </div>`;

    const drawRows = () => {
      const kw = this.keyword.trim().toLowerCase();
      const list = leads
        .filter(l => this.level === 'all' || l.level === this.level)
        .filter(l => !kw || (l.name + l.company + l.email + l.keywords.join('')).toLowerCase().includes(kw))
        .sort((a, b) => b.score - a.score);
      const tb = document.getElementById('leadTbody');
      if (!list.length) { tb.innerHTML = '<tr><td colspan="8"><div class="empty"><div class="empty__title">没有符合条件的客户</div></div></td></tr>'; return; }
      tb.innerHTML = list.map(l => {
        const color = l.score >= 80 ? 'var(--success)' : l.score >= 50 ? 'var(--warning)' : 'var(--text-3)';
        const lvBadge = { '高意向': 'badge--green', '中意向': 'badge--amber', '低意向': 'badge--gray', '无效': 'badge--red' }[l.level];
        return `<tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px">
              <span class="avatar avatar--sm ${l.avatar}">${UI.initial(l.name)}</span>
              <div>
                <div class="strong">${l.name}</div>
                <div class="muted" style="font-size:12px">${l.company} · ${l.email}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="score-wrap">
              <div class="score-bar"><div class="score-bar__fill" style="width:${l.score}%;background:${color}"></div></div>
              <span class="score-num" style="color:${color}">${l.score}</span>
            </div>
          </td>
          <td><span class="badge ${lvBadge}">${l.level}</span></td>
          <td style="font-size:12.5px">${l.replySpeed}</td>
          <td>${l.keywords.map(k => `<span class="tag tag--indigo">${k}</span>`).join('')}</td>
          <td class="muted" style="font-size:12.5px;max-width:200px">${l.interactions}</td>
          <td class="muted" style="font-size:12.5px">${l.source}</td>
          <td>
            <button class="btn btn--ghost btn--sm" data-mail="${l.email}">发邮件</button>
          </td>
        </tr>`;
      }).join('');
      tb.querySelectorAll('[data-mail]').forEach(b =>
        b.addEventListener('click', () => openComposeModal({ to: b.dataset.mail })));
    };
    drawRows();

    container.querySelectorAll('[data-lv]').forEach(b =>
      b.addEventListener('click', () => { this.level = b.dataset.lv; this.render(container); }));
    document.getElementById('leadSearch').addEventListener('input', e => { this.keyword = e.target.value; drawRows(); });

    document.getElementById('exportLeads').addEventListener('click', () => {
      const kw = this.keyword.trim().toLowerCase();
      const list = leads
        .filter(l => this.level === 'all' || l.level === this.level)
        .filter(l => !kw || (l.name + l.company + l.email + l.keywords.join('')).toLowerCase().includes(kw));
      if (!list.length) { UI.toast('当前筛选下没有可导出的客户', 'error'); return; }
      UI.downloadCSV('意向客户名单_' + new Date().toISOString().slice(0, 10) + '.csv', [
        ['姓名', '邮箱', '公司', '意向评分', '等级', '回复速度', '意向关键词', '互动摘要', '来源', '最近互动'],
        ...list.map(l => [l.name, l.email, l.company, l.score, l.level, l.replySpeed, l.keywords.join('；'), l.interactions, l.source, l.lastActive])
      ]);
      UI.toast(`已导出 ${list.length} 位客户（含基本信息与互动历史）`, 'success', 3000);
    });

    document.getElementById('ruleBtn').addEventListener('click', () => {
      UI.modal({
        title: '意向客户评分模型（说明）',
        size: 'md',
        bodyHTML: `
          <p style="color:var(--text-2);font-size:13px;line-height:1.8;margin-bottom:14px">
            系统对近 30 天有互动的客户自动打分（0–100），规则如下：
          </p>
          <div class="stat-line"><span class="sl-label">📨 回复速度</span><span class="sl-value">权重 35%</span></div>
          <div class="stat-line" style="padding-left:18px"><span class="sl-label muted">2 小时内回复 +35 · 当天 +25 · 3 天内 +10</span></div>
          <div class="stat-line"><span class="sl-label">🔑 内容关键词</span><span class="sl-value">权重 30%</span></div>
          <div class="stat-line" style="padding-left:18px"><span class="sl-label muted">报价 / 试用 / 合作 / 合同 / 报名 / 采购 等</span></div>
          <div class="stat-line"><span class="sl-label">🔁 互动频率</span><span class="sl-value">权重 25%</span></div>
          <div class="stat-line" style="padding-left:18px"><span class="sl-label muted">打开次数、点击链接、往来邮件数</span></div>
          <div class="stat-line"><span class="sl-label">⚠️ 负向信号</span><span class="sl-value">扣分</span></div>
          <div class="stat-line" style="padding-left:18px"><span class="sl-label muted">退信 -50 · 明确拒绝 -40 · 30 天无互动 -20</span></div>
          <div class="form-hint" style="margin-top:14px">≥ 80 标记为「高意向」，50–79 为「中意向」，其余为低意向；退信地址标记为无效。</div>`,
        footer: () => '<button class="btn btn--primary" data-close>知道了</button>'
      });
    });
  }
};
