/* ==========================================================================
   状态管理 · 通用工具 · 模拟 API
   ========================================================================== */

const Store = (() => {
  const STORAGE_KEY = 'mailhub_demo_v1';

  // 深拷贝初始数据
  const seed = JSON.parse(JSON.stringify(MOCK));
  let state = null;

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state = JSON.parse(saved);
        // 新字段兜底
        state.accounts = state.accounts || seed.accounts;
        state.campaigns = state.campaigns || seed.campaigns;
        state.emails = state.emails || seed.emails;
        state.sentMails = state.sentMails || [];
      } else {
        state = seed;
        state.sentMails = [];
      }
    } catch (e) {
      state = seed;
      state.sentMails = [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    load();
  }

  load();

  return {
    state,
    save,
    reset,

    /* ---------- 邮箱账号 ---------- */
    addAccount(acc) {
      acc.id = 'acc-' + Date.now();
      acc.status = 'connected';
      acc.boundAt = new Date().toISOString().slice(0, 10);
      state.accounts.push(acc);
      save();
      return acc;
    },
    toggleAccount(id) {
      const a = state.accounts.find(x => x.id === id);
      if (!a) return;
      a.status = a.status === 'disabled' ? 'connected' : 'disabled';
      save();
    },
    removeAccount(id) {
      state.accounts = state.accounts.filter(a => a.id !== id);
      save();
    },

    /* ---------- 邮件 ---------- */
    markEmailRead(id) {
      const m = state.emails.find(e => e.id === id);
      if (m) { m.unread = false; save(); }
    },
    toggleStar(id) {
      const m = state.emails.find(e => e.id === id);
      if (m) { m.starred = !m.starred; save(); }
    },
    addReply(mailId, content) {
      const m = state.emails.find(e => e.id === mailId);
      const acc = state.accounts.find(a => a.isDefault) || state.accounts[0];
      if (m) {
        m.body.push({ from: 'me', name: '张伟', email: acc.email,
          time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
          content: '<p>' + content.replace(/\n/g, '<br/>') + '</p>' });
        m.unread = false;
        save();
      }
    },
    sendMail(mail) {
      state.sentMails.unshift({
        id: 'sent-' + Date.now(),
        ...mail,
        time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        ts: Date.now()
      });
      save();
    },
    unreadCount() {
      return state.emails.filter(e => e.unread && e.folder === 'inbox').length;
    },

    /* ---------- 联系人 ---------- */
    getContact(id) { return state.contacts.find(c => c.id === id); },

    /* ---------- 任务 ---------- */
    getCampaign(id) { return state.campaigns.find(c => c.id === id); },
    addCampaign(c) {
      c.id = 'cmp-' + Date.now();
      c.createdAt = new Date().toISOString().slice(0, 10);
      state.campaigns.unshift(c);
      save();
      return c;
    },
    updateCampaign(id, patch) {
      const c = state.campaigns.find(x => x.id === id);
      if (c) { Object.assign(c, patch); save(); }
    },

    /* ---------- 意向客户 ---------- */
    leads() { return state.leads || seed.leads; }
  };
})();

/* ================= 模拟 API（带延迟与加载态） ================= */
const mockApi = (data, delay = 450) =>
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));

/* ================= 通用 UI 工具 ================= */
const UI = {
  /* Toast */
  toast(msg, type = 'success', duration = 2600) {
    const icons = {
      success: '<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    const stack = document.getElementById('toastStack');
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.innerHTML = icons[type] + '<span>' + msg + '</span>';
    stack.appendChild(el);
    setTimeout(() => {
      el.classList.add('leaving');
      setTimeout(() => el.remove(), 260);
    }, duration);
  },

  /* Modal：opts = { title, size, bodyHTML, onOpen(modal), footer(modal)->html, onMount(modal) } */
  modal(opts) {
    const root = document.getElementById('modalRoot');
    const mask = document.createElement('div');
    mask.className = 'modal-mask';
    mask.innerHTML = `
      <div class="modal modal--${opts.size || 'md'}">
        <div class="modal__head">
          <div class="modal__title">${opts.title}</div>
          <button class="modal__close" data-close>
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal__body">${opts.bodyHTML || ''}</div>
        ${opts.footer !== null ? `<div class="modal__foot">${opts.footer ? opts.footer() : ''}</div>` : ''}
      </div>`;
    root.appendChild(mask);
    const close = () => { mask.remove(); document.removeEventListener('keydown', esc); };
    const esc = e => { if (e.key === 'Escape') close(); };
    mask.addEventListener('click', e => { if (e.target === mask || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', esc);
    if (opts.onMount) opts.onMount(mask, close);
    return { close, el: mask };
  },

  /* 确认框 */
  confirm(title, text, onOk, okText = '确认', danger = false) {
    const m = this.modal({
      title,
      bodyHTML: `<p style="color:var(--text-2);line-height:1.7;font-size:13.5px">${text}</p>`,
      footer: () => `
        <button class="btn btn--ghost" data-close>取消</button>
        <button class="btn ${danger ? 'btn--danger' : 'btn--primary'}" data-ok>${okText}</button>`
    });
    m.el.querySelector('[data-ok]').addEventListener('click', () => {
      m.close();
      onOk && onOk();
    });
  },

  /* 邮箱服务商类型映射 */
  accountLabel(id) {
    const a = Store.state.accounts.find(x => x.id === id);
    return a ? a.email : '—';
  },

  /* 头像颜色轮换 */
  avatarColor(name) {
    const palette = ['avatar--indigo', 'avatar--sky', 'avatar--green', 'avatar--amber', 'avatar--rose', 'avatar--violet', 'avatar--teal'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
  },

  initial(name) { return (name || '?').trim().charAt(0); },

  pct(part, total) { return total ? ((part / total) * 100).toFixed(1) : '0.0'; },

  /* 下载 CSV */
  downloadCSV(filename, rows) {
    const csv = '\ufeff' + rows.map(r =>
      r.map(cell => `"${String(cell == null ? '' : cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
};

/* 收件人状态字典 */
const RECIPIENT_STATUS = {
  replied:   { label: '已回复', badge: 'badge--green' },
  clicked:   { label: '已点击', badge: 'badge--indigo' },
  opened:    { label: '已打开', badge: 'badge--blue' },
  delivered: { label: '已送达', badge: 'badge--gray' },
  bounced:   { label: '退信',   badge: 'badge--red' },
  pending:   { label: '待发送', badge: 'badge--amber' }
};

const CAMPAIGN_STATUS = {
  draft:     { label: '草稿',   badge: 'badge--gray' },
  scheduled: { label: '定时中', badge: 'badge--blue' },
  sending:   { label: '发送中', badge: 'badge--indigo' },
  completed: { label: '已完成', badge: 'badge--green' }
};
