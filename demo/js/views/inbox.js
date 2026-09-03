/* 统一收件箱 + 写信编辑器 */
window.Views = window.Views || {};

Views.inbox = {
  filter: 'all',       // all | unread | starred
  accountFilter: 'all',
  keyword: '',
  selectedId: null,

  render(container) {
    const s = Store.state;
    this.selectedId = this.selectedId || (s.emails[0] && s.emails[0].id);

    container.innerHTML = `
      <div class="page-head">
        <div>
          <div class="page-title">统一收件箱</div>
          <div class="page-desc">${s.accounts.filter(a => a.status === 'connected').length} 个已绑定邮箱的来信集中展示，按联系人自动归档</div>
        </div>
        <div class="page-head__actions">
          <button class="btn btn--primary" id="inboxComposeBtn">
            <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            写邮件
          </button>
        </div>
      </div>

      <div class="card mb-16">
        <div class="toolbar">
          <button class="filter-chip ${this.filter === 'all' ? 'active' : ''}" data-filter="all">全部</button>
          <button class="filter-chip ${this.filter === 'unread' ? 'active' : ''}" data-filter="unread">未读 <span style="opacity:.75">${Store.unreadCount()}</span></button>
          <button class="filter-chip ${this.filter === 'starred' ? 'active' : ''}" data-filter="starred">星标</button>
          <span style="width:1px;height:20px;background:var(--border);margin:0 4px"></span>
          <select class="select" style="width:auto;padding:7px 30px 7px 12px" id="inboxAccount">
            <option value="all">全部邮箱账号</option>
            ${s.accounts.map(a => `<option value="${a.id}" ${this.accountFilter === a.id ? 'selected' : ''}>${a.email}</option>`).join('')}
          </select>
          <div class="spacer"></div>
          <div class="search-box">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="inboxSearch" placeholder="搜索发件人 / 主题…" value="${this.keyword}"/>
          </div>
        </div>
      </div>

      <div class="mail-layout">
        <div class="card" style="overflow:hidden">
          <div class="mail-list" id="mailList"></div>
        </div>
        <div class="card mail-read" id="mailRead" style="min-height:600px"></div>
      </div>`;

    document.getElementById('inboxComposeBtn').addEventListener('click', () => openComposeModal());

    container.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => { this.filter = btn.dataset.filter; this.render(container); });
    });
    document.getElementById('inboxAccount').addEventListener('change', e => {
      this.accountFilter = e.target.value; this.render(container);
    });
    document.getElementById('inboxSearch').addEventListener('input', e => {
      this.keyword = e.target.value; this.renderList();
    });

    this.renderList();
    this.renderRead();
  },

  filtered() {
    const kw = this.keyword.trim().toLowerCase();
    return Store.state.emails.filter(m => {
      if (this.filter === 'unread' && !m.unread) return false;
      if (this.filter === 'starred' && !m.starred) return false;
      if (this.accountFilter !== 'all' && m.accountId !== this.accountFilter) return false;
      if (kw && !(m.fromName + m.fromEmail + m.subject + m.preview).toLowerCase().includes(kw)) return false;
      return true;
    });
  },

  renderList() {
    const list = this.filtered();
    const el = document.getElementById('mailList');
    if (!el) return;
    if (!list.length) {
      el.innerHTML = `<div class="empty">
        <svg viewBox="0 0 24 24"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
        <div class="empty__title">没有符合条件的邮件</div>
        <div class="empty__desc">试试切换筛选条件或清空搜索关键词</div>
      </div>`;
      return;
    }
    el.innerHTML = list.map(m => {
      const acc = Store.state.accounts.find(a => a.id === m.accountId);
      return `
      <div class="mail-item ${m.unread ? 'unread' : ''} ${m.id === this.selectedId ? 'active' : ''}" data-id="${m.id}">
        <span class="avatar avatar--sm ${UI.avatarColor(m.fromName)}">${UI.initial(m.fromName)}</span>
        <div class="mail-item__main">
          <div class="mail-item__row1">
            <span class="mail-item__from">${m.bounce ? '⚠ 退信通知' : m.fromName}
              <span style="color:var(--text-3);font-weight:400;font-size:11.5px">· ${acc ? acc.type : ''}</span>
            </span>
            <span class="mail-item__time">${m.time.slice(5, 16)}</span>
          </div>
          <div class="mail-item__subject">${m.subject}</div>
          <div class="mail-item__preview">${m.preview}</div>
          <div class="mail-item__meta">
            <button class="star-btn ${m.starred ? 'on' : ''}" data-star="${m.id}" title="星标">
              <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </button>
            ${m.hasAttachment ? '<span class="tag tag--indigo">📎 附件</span>' : ''}
            ${m.bounce ? '<span class="badge badge--red">退信</span>' : ''}
          </div>
        </div>
      </div>`;
    }).join('');

    el.querySelectorAll('.mail-item').forEach(item => {
      item.addEventListener('click', e => {
        if (e.target.closest('[data-star]')) return;
        this.selectedId = item.dataset.id;
        Store.markEmailRead(this.selectedId);
        App.refreshBadges();
        this.renderList();
        this.renderRead();
      });
    });
    el.querySelectorAll('[data-star]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        Store.toggleStar(btn.dataset.star);
        this.renderList();
      });
    });
  },

  renderRead() {
    const el = document.getElementById('mailRead');
    if (!el) return;
    const m = Store.state.emails.find(x => x.id === this.selectedId);
    if (!m) {
      el.innerHTML = `<div class="empty" style="padding:100px 20px">
        <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        <div class="empty__title">选择一封邮件开始阅读</div>
      </div>`;
      return;
    }

    const acc = Store.state.accounts.find(a => a.id === m.accountId);
    el.innerHTML = `
      <div class="mail-read__head">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
          <div class="mail-read__subject" style="margin-bottom:0">${m.subject}</div>
          <button class="star-btn ${m.starred ? 'on' : ''}" id="readStar" style="margin-top:4px">
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </button>
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
          <span class="badge badge--blue">收件账号：${acc ? acc.email : '—'}</span>
          ${m.bounce ? '<span class="badge badge--red">系统退信</span>' : '<span class="badge badge--green">已成功送达</span>'}
        </div>
      </div>
      <div class="card__body">
        ${m.body.map(msg => `
          <div class="thread-item ${msg.from === 'me' ? 'me' : ''}">
            <span class="avatar avatar--sm ${UI.avatarColor(msg.name)}">${UI.initial(msg.name)}</span>
            <div class="thread-item__body">
              <div class="thread-item__meta">
                <span class="tname">${msg.name}</span>
                <span class="taddr">&lt;${msg.email}&gt;</span>
                <span class="ttime">${msg.time}</span>
              </div>
              <div class="thread-item__content">${msg.content}</div>
            </div>
          </div>`).join('')}
        ${m.attachments ? m.attachments.map(a => `
          <div class="mail-attach" style="margin:12px 0">
            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <div><div class="fname">${a.name}</div><div class="fsize">${a.size}</div></div>
          </div>`).join('') : ''}
      </div>
      <div class="mail-read__reply">
        <div class="reply-box">
          <div class="reply-box__toolbar">
            <button data-cmd="bold" title="加粗"><b>B</b></button>
            <button data-cmd="italic" title="斜体"><i>I</i></button>
            <button data-cmd="underline" title="下划线"><u>U</u></button>
            <button data-cmd="insertUnorderedList" title="列表">
              <svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
          </div>
          <div class="reply-box__editor" id="replyEditor" contenteditable="true" data-placeholder="回复 ${m.fromName}…"></div>
          <div class="reply-box__foot">
            <span style="font-size:12px;color:var(--text-3)">回复将通过 <b style="color:var(--text-2)">${acc ? acc.email : ''}</b> 发送</span>
            <button class="btn btn--primary btn--sm" id="sendReplyBtn">
              <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              发送回复
            </button>
          </div>
        </div>
      </div>`;

    document.getElementById('readStar').addEventListener('click', () => {
      Store.toggleStar(m.id); this.renderList(); this.renderRead();
    });

    const editor = document.getElementById('replyEditor');
    el.querySelectorAll('[data-cmd]').forEach(b => {
      b.addEventListener('click', () => {
        editor.focus();
        document.execCommand(b.dataset.cmd, false, null);
      });
    });

    document.getElementById('sendReplyBtn').addEventListener('click', async () => {
      const text = editor.innerText.trim();
      if (!text) { UI.toast('请输入回复内容', 'error'); return; }
      const btn = document.getElementById('sendReplyBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px"></span> 发送中…';
      await mockApi(null, 700);
      Store.addReply(m.id, text);
      UI.toast(`回复已发送给 ${m.fromName}`, 'success');
      this.renderRead();
    });
  }
};

/* ================= 写信编辑器（弹窗） ================= */
function openComposeModal(prefill) {
  prefill = prefill || {};
  const accounts = Store.state.accounts.filter(a => a.status === 'connected');
  const tpls = Store.state.templates || MOCK.templates;
  let attachments = [];

  const m = UI.modal({
    title: '写邮件',
    size: 'lg',
    footer: null,
    bodyHTML: `
      <div class="compose-meta">
        <div class="form-row" style="margin-bottom:0">
          <select class="input" id="cmpAccount" style="margin-bottom:8px">
            ${accounts.map(a => `<option value="${a.id}">发件人：${a.email}</option>`).join('')}
          </select>
          <input class="input" id="cmpTo" placeholder="收件人邮箱（多个用逗号分隔）" value="${prefill.to || ''}"/>
        </div>
        <input class="input" id="cmpCc" placeholder="抄送（可选）"/>
        <div style="display:flex;gap:10px;align-items:center">
          <input class="input" id="cmpSubject" placeholder="邮件主题" style="flex:1" value="${prefill.subject || ''}"/>
          <select class="select" id="cmpTemplate" style="width:200px">
            <option value="">选择模板…</option>
            ${tpls.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="border:1px solid var(--border);border-radius:10px;margin:14px 24px;overflow:hidden">
        <div class="editor-toolbar">
          <button data-cmd="bold" title="加粗"><b>加粗</b></button>
          <button data-cmd="italic" title="斜体"><i>斜体</i></button>
          <button data-cmd="underline" title="下划线"><u>下划线</u></button>
          <span class="sep"></span>
          <button data-cmd="insertUnorderedList" title="无序列表">
            <svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
          <button data-cmd="insertOrderedList" title="有序列表">
            <svg viewBox="0 0 24 24"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
          </button>
          <span class="sep"></span>
          <button id="cmpAttachBtn" title="添加附件">
            <svg viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            附件
          </button>
        </div>
        <div class="editor-area" id="cmpBody" contenteditable="true" data-placeholder="撰写邮件正文…">${prefill.body || ''}</div>
        <div class="attach-list" id="cmpAttachList"></div>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:10px;padding:0 24px 4px">
        <button class="btn btn--ghost" data-close>存为草稿</button>
        <button class="btn btn--primary" id="cmpSendBtn">
          <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          发送邮件
        </button>
      </div>`
  });

  const body = m.el;
  const editor = body.querySelector('#cmpBody');

  body.querySelectorAll('[data-cmd]').forEach(b => {
    b.addEventListener('click', () => { editor.focus(); document.execCommand(b.dataset.cmd, false, null); });
  });

  // 模板选择
  body.querySelector('#cmpTemplate').addEventListener('change', e => {
    const tpl = tpls.find(t => t.id === e.target.value);
    if (tpl) {
      body.querySelector('#cmpSubject').value = tpl.subject.replace(/\{\{客户名\}\}/g, '尊敬的客户');
      editor.innerHTML = tpl.body.replace(/\{\{客户名\}\}/g, '尊敬的客户');
      UI.toast(`已套用模板：${tpl.name}`, 'info', 1800);
    }
  });

  // 模拟附件上传
  const mockFiles = [
    { name: 'Acme产品介绍_2026.pdf', size: '1.8 MB' },
    { name: '智能客服方案报价单.xlsx', size: '420 KB' },
    { name: '服务合同模板.docx', size: '260 KB' }
  ];
  body.querySelector('#cmpAttachBtn').addEventListener('click', () => {
    const f = mockFiles[attachments.length % mockFiles.length];
    if (attachments.some(a => a.name === f.name)) { UI.toast('该附件已添加', 'error'); return; }
    attachments.push(f);
    renderAttaches();
    UI.toast(`附件「${f.name}」上传成功（模拟）`, 'info', 1600);
  });
  function renderAttaches() {
    body.querySelector('#cmpAttachList').innerHTML = attachments.map((a, i) => `
      <div class="attach-row">
        <svg class="ic" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span class="aname">${a.name}</span>
        <span class="asize">${a.size}</span>
        <button class="arm" data-rm="${i}"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>`).join('');
    body.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => {
      attachments.splice(+b.dataset.rm, 1); renderAttaches();
    }));
  }

  // 发送
  body.querySelector('#cmpSendBtn').addEventListener('click', async () => {
    const to = body.querySelector('#cmpTo').value.trim();
    const subject = body.querySelector('#cmpSubject').value.trim();
    const content = editor.innerHTML;
    const emailRe = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/;

    let ok = true;
    if (!to) { markErr('#cmpTo', true); ok = false; }
    else { markErr('#cmpTo', !to.split(',').every(a => emailRe.test(a.trim()))); if (!to.split(',').every(a => emailRe.test(a.trim()))) ok = false; }
    if (!subject) markErr('#cmpSubject', true), ok = false; else markErr('#cmpSubject', false);
    if (!editor.innerText.trim()) { editor.style.border = '1px solid var(--danger)'; ok = false; } else editor.style.border = '';
    if (!ok) { UI.toast('请完整填写收件人、主题和正文', 'error'); return; }

    const btn = body.querySelector('#cmpSendBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.4);border-top-color:#fff"></span> 发送中…';
    await mockApi(null, 900);

    Store.sendMail({
      to, subject, body: content,
      accountId: body.querySelector('#cmpAccount').value,
      attachments: attachments.slice()
    });
    m.close();
    UI.toast(`邮件已发送至 ${to.split(',')[0].trim()}`, 'success');
  });

  function markErr(sel, bad) {
    const n = body.querySelector(sel);
    n.classList.toggle('input-error', bad);
  }
}
window.openComposeModal = openComposeModal;
