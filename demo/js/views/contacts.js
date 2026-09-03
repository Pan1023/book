/* 联系人会话归档 */
window.Views = window.Views || {};

Views.contacts = {
  keyword: '',
  selectedId: null,

  render(container) {
    const s = Store.state;
    this.selectedId = this.selectedId || (s.contacts[0] && s.contacts[0].id);

    container.innerHTML = `
      <div class="page-head">
        <div>
          <div class="page-title">联系人会话</div>
          <div class="page-desc">按联系人自动归档的完整邮件往来历史，共 ${s.contacts.length} 位联系人</div>
        </div>
        <div class="page-head__actions">
          <div class="search-box">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="ctSearch" placeholder="搜索姓名 / 公司 / 邮箱…" value="${this.keyword}"/>
          </div>
        </div>
      </div>

      <div class="mail-layout">
        <div class="card" style="overflow:hidden">
          <div id="ctList" style="max-height:calc(100vh - 200px);overflow-y:auto"></div>
        </div>
        <div class="card" id="ctDetail" style="min-height:600px"></div>
      </div>`;

    document.getElementById('ctSearch').addEventListener('input', e => {
      this.keyword = e.target.value; this.renderList();
    });
    this.renderList();
    this.renderDetail();
  },

  list() {
    const kw = this.keyword.trim().toLowerCase();
    return Store.state.contacts.filter(c =>
      !kw || (c.name + c.company + c.email).toLowerCase().includes(kw)
    ).sort((a, b) => b.intent - a.intent);
  },

  renderList() {
    const el = document.getElementById('ctList');
    const list = this.list();
    if (!list.length) {
      el.innerHTML = `<div class="empty"><div class="empty__title">未找到联系人</div></div>`;
      return;
    }
    el.innerHTML = list.map(c => `
      <div class="mail-item ${c.id === this.selectedId ? 'active' : ''}" data-id="${c.id}">
        <span class="avatar ${c.avatar}">${UI.initial(c.name)}</span>
        <div class="mail-item__main">
          <div class="mail-item__row1">
            <span class="mail-item__from">${c.name}</span>
            <span class="mail-item__time">${c.lastActive.slice(5)}</span>
          </div>
          <div class="mail-item__preview">${c.company} · ${c.email}</div>
          <div class="mail-item__meta">
            <span class="tag">${c.threadCount} 封往来</span>
            <span class="score-bar" style="width:52px"><span class="score-bar__fill" style="width:${c.intent}%;background:${c.intent >= 80 ? 'var(--success)' : c.intent >= 50 ? 'var(--warning)' : 'var(--text-3)'}"></span></span>
            <span style="font-size:11.5px;color:var(--text-3)">意向 ${c.intent}</span>
          </div>
        </div>
      </div>`).join('');

    el.querySelectorAll('.mail-item').forEach(it =>
      it.addEventListener('click', () => {
        this.selectedId = it.dataset.id;
        this.renderList(); this.renderDetail();
      }));
  },

  renderDetail() {
    const el = document.getElementById('ctDetail');
    const c = Store.state.contacts.find(x => x.id === this.selectedId);
    if (!c) { el.innerHTML = '<div class="empty"><div class="empty__title">请选择联系人</div></div>'; return; }

    // 聚合该联系人相关邮件
    const mails = Store.state.emails.filter(m => m.contactId === c.id || m.fromEmail === c.email);
    const thread = [];
    mails.forEach(m => m.body.forEach(msg => thread.push({ ...msg, subject: m.subject })));
    thread.sort((a, b) => (a.time > b.time ? 1 : -1));

    el.innerHTML = `
      <div class="card__head">
        <div style="display:flex;align-items:center;gap:14px">
          <span class="avatar avatar--lg ${c.avatar}">${UI.initial(c.name)}</span>
          <div>
            <div style="font-size:16px;font-weight:700">${c.name}
              <span class="badge ${c.intent >= 80 ? 'badge--green' : c.intent >= 50 ? 'badge--amber' : 'badge--gray'}" style="margin-left:6px">意向 ${c.intent} 分</span>
            </div>
            <div style="color:var(--text-3);font-size:12.5px;margin-top:3px">${c.company} · ${c.email}</div>
          </div>
        </div>
        <button class="btn btn--primary btn--sm" id="ctWrite">
          <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          写邮件
        </button>
      </div>
      <div class="card__body">
        <div style="margin-bottom:16px">
          ${c.tags.map(t => `<span class="tag ${t.includes('高意向') || t.includes('成交') ? 'tag--gold' : ''}">${t}</span>`).join('')}
        </div>
        <div class="card__title" style="margin-bottom:6px">
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          往来会话（${thread.length} 条）
        </div>
        ${thread.length ? thread.map(msg => `
          <div class="thread-item ${msg.from === 'me' ? 'me' : ''}">
            <span class="avatar avatar--sm ${UI.avatarColor(msg.name)}">${UI.initial(msg.name)}</span>
            <div class="thread-item__body">
              <div class="thread-item__meta">
                <span class="tname">${msg.name}</span>
                <span class="taddr">&lt;${msg.email}&gt;</span>
                <span class="ttime">${msg.time} · 主题：${msg.subject}</span>
              </div>
              <div class="thread-item__content">${msg.content}</div>
            </div>
          </div>`).join('') : '<div class="empty"><div class="empty__desc">暂无往来邮件记录</div></div>'}
      </div>`;

    document.getElementById('ctWrite').addEventListener('click', () => {
      openComposeModal({ to: c.email, subject: '', body: '' });
    });
  }
};
