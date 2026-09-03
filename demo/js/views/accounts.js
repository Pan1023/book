/* 邮箱账号绑定 */
window.Views = window.Views || {};

Views.accounts = {
  render(container) {
    const s = Store.state;
    const connected = s.accounts.filter(a => a.status === 'connected').length;

    container.innerHTML = `
      <div class="page-head">
        <div>
          <div class="page-title">邮箱账号绑定</div>
          <div class="page-desc">绑定自有邮箱（企业邮箱 / Gmail 等），通过 SMTP 发信、IMAP 收信，凭据加密存储</div>
        </div>
        <div class="page-head__actions">
          <button class="btn btn--primary" id="addAccountBtn">
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            绑定新邮箱
          </button>
        </div>
      </div>

      <div class="grid grid-3 mb-16">
        <div class="card kpi">
          <div class="kpi__top"><span class="kpi__label">已绑定账号</span>
            <span class="kpi__icon ic-indigo"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
          </div>
          <div class="kpi__value">${s.accounts.length}</div>
          <div class="kpi__foot">${connected} 个连接正常</div>
        </div>
        <div class="card kpi">
          <div class="kpi__top"><span class="kpi__label">今日通过绑定邮箱发送</span>
            <span class="kpi__icon ic-green"><svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></span>
          </div>
          <div class="kpi__value">86</div>
          <div class="kpi__foot"><span class="kpi__trend trend-up">↑ 12%</span> 较昨日</div>
        </div>
        <div class="card kpi">
          <div class="kpi__top"><span class="kpi__label">连接异常</span>
            <span class="kpi__icon ic-red"><svg viewBox="0 0 24 24"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>
          </div>
          <div class="kpi__value">${s.accounts.filter(a => a.status === 'error').length}</div>
          <div class="kpi__foot" style="color:var(--danger)">需要重新授权</div>
        </div>
      </div>

      <div class="grid" id="acctList" style="gap:12px"></div>`;

    document.getElementById('addAccountBtn').addEventListener('click', () => this.openAddModal(container));
    this.renderList(container);
  },

  renderList(container) {
    const s = Store.state;
    const el = document.getElementById('acctList');
    el.innerHTML = s.accounts.map(a => {
      const stMap = {
        connected: ['badge--green', '连接正常'],
        error: ['badge--red', '连接异常'],
        disabled: ['badge--gray', '已停用']
      };
      const [badge, label] = stMap[a.status];
      const icon = a.type.includes('Gmail') ? '✉️' : '🏢';
      return `
      <div class="card acct-card" data-id="${a.id}">
        <div class="acct-card__icon ${a.type.includes('Gmail') ? 'ic-amber' : 'ic-indigo'}">${icon}</div>
        <div class="acct-card__info">
          <div class="acct-card__email">
            ${a.email}
            ${a.isDefault ? '<span class="tag tag--indigo" style="margin-left:6px">默认发件</span>' : ''}
          </div>
          <div class="acct-card__meta">
            <span class="badge ${badge}">${label}</span>
            <span>${a.type}</span>
            <span>SMTP: ${a.smtp}</span>
            <span>IMAP: ${a.imap}</span>
            <span>绑定于 ${a.boundAt}</span>
          </div>
        </div>
        <div class="acct-card__actions">
          ${!a.isDefault && a.status === 'connected' ? '<button class="btn btn--ghost btn--sm" data-default>设为默认</button>' : ''}
          <button class="btn btn--ghost btn--sm" data-test>
            <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            测试连接
          </button>
          <label class="switch" title="启用/停用">
            <input type="checkbox" data-toggle ${a.status !== 'disabled' ? 'checked' : ''}>
            <span class="switch__slider"></span>
          </label>
          <button class="btn btn--ghost btn--sm" data-del title="删除" style="color:var(--danger)">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>`;
    }).join('');

    el.querySelectorAll('.acct-card').forEach(card => {
      const id = card.dataset.id;
      const acc = s.accounts.find(x => x.id === id);

      card.querySelector('[data-test]').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width:13px;height:13px;border-width:2px"></span> 测试中…';
        await mockApi(null, 1200);
        btn.disabled = false;
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> 测试连接';
        if (acc.status === 'error') {
          UI.toast(`连接失败：${acc.email} 授权已过期，请重新输入密码/授权码`, 'error', 3200);
        } else {
          UI.toast(`连接成功：SMTP/IMAP 通道均正常（${acc.email}）`, 'success');
        }
      });

      card.querySelector('[data-toggle]').addEventListener('change', () => {
        Store.toggleAccount(id);
        UI.toast(acc.status === 'disabled' ? `已停用 ${acc.email}` : `已启用 ${acc.email}`, 'info');
        this.renderList(container);
      });

      const delBtn = card.querySelector('[data-del]');
      if (delBtn) delBtn.addEventListener('click', () => {
        UI.confirm('解绑邮箱', `确认解绑邮箱 <b>${acc.email}</b>？解绑后该邮箱将停止收发，历史邮件仍会保留。`, () => {
          Store.removeAccount(id);
          UI.toast('邮箱已解绑', 'success');
          this.render(container);
        }, '确认解绑', true);
      });

      const defBtn = card.querySelector('[data-default]');
      if (defBtn) defBtn.addEventListener('click', () => {
        s.accounts.forEach(x => x.isDefault = x.id === id);
        Store.save();
        UI.toast(`默认发件邮箱已切换为 ${acc.email}`, 'success');
        this.renderList(container);
      });
    });
  },

  openAddModal(container) {
    const presets = MOCK.providerPresets;
    let tested = false;

    const m = UI.modal({
      title: '绑定新邮箱',
      size: 'md',
      bodyHTML: `
        <div class="form-row">
          <label class="form-label">邮箱服务商<span class="req">*</span></label>
          <select class="select" id="acType">
            ${presets.map((p, i) => `<option value="${i}">${p.type}</option>`).join('')}
          </select>
        </div>
        <div class="form-grid-2">
          <div class="form-row">
            <label class="form-label">邮箱地址<span class="req">*</span></label>
            <input class="input" id="acEmail" placeholder="name@company.com"/>
            <div class="error-msg" id="acEmailErr">请输入合法的邮箱地址</div>
          </div>
          <div class="form-row">
            <label class="form-label">发件显示名</label>
            <input class="input" id="acName" placeholder="如：张伟（销售部）"/>
          </div>
        </div>
        <div class="form-row">
          <label class="form-label">密码 / 授权码<span class="req">*</span></label>
          <input class="input" id="acPwd" type="password" placeholder="邮箱密码或应用专用授权码（将加密存储）"/>
        </div>
        <div class="form-grid-2">
          <div class="form-row">
            <label class="form-label">SMTP 服务器</label>
            <input class="input" id="acSmtp" placeholder="smtp.example.com"/>
          </div>
          <div class="form-row">
            <label class="form-label">IMAP 服务器</label>
            <input class="input" id="acImap" placeholder="imap.example.com"/>
          </div>
        </div>
        <div class="form-row">
          <label class="form-label">端口 / 加密</label>
          <div style="display:flex;gap:10px">
            <select class="select" id="acPort" style="width:130px">
              <option value="465">465 (SSL)</option>
              <option value="587">587 (TLS)</option>
              <option value="993">993 (IMAP SSL)</option>
            </select>
            <span class="form-hint" style="margin-top:9px">推荐使用 SSL/TLS 加密连接</span>
          </div>
        </div>
        <div class="form-hint" style="background:var(--primary-light);padding:10px 14px;border-radius:8px;color:var(--primary-dark)">
          🔒 所有凭据均采用 AES-256 加密存储，仅用于邮件通道连接，演示环境不会真正发送请求。
        </div>`,
      footer: () => `
        <button class="btn btn--ghost" data-test-conn>
          <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          测试连接
        </button>
        <button class="btn btn--ghost" data-close>取消</button>
        <button class="btn btn--primary" data-bind>确认绑定</button>`
    });

    const body = m.el;
    const $ = sel => body.querySelector(sel);

    function applyPreset() {
      const p = presets[+$('#acType').value];
      $('#acSmtp').value = p.smtp;
      $('#acImap').value = p.imap;
      $('#acPort').value = p.port;
    }
    $('#acType').addEventListener('change', () => { applyPreset(); tested = false; });
    applyPreset();

    body.querySelector('[data-test-conn]').addEventListener('click', async () => {
      const email = $('#acEmail').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        $('#acEmail').classList.add('input-error');
        $('#acEmailErr').classList.add('show');
        UI.toast('请先填写正确的邮箱地址', 'error');
        return;
      }
      const btn = body.querySelector('[data-test-conn]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="width:13px;height:13px;border-width:2px"></span> 正在连接…';
      await mockApi(null, 1400);
      btn.disabled = false;
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> 测试连接';
      tested = true;
      UI.toast('连接测试通过：SMTP 发信 / IMAP 收信均正常', 'success');
    });

    body.querySelector('[data-bind]').addEventListener('click', async () => {
      const email = $('#acEmail').value.trim();
      const pwd = $('#acPwd').value.trim();
      let bad = false;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $('#acEmail').classList.add('input-error'); $('#acEmailErr').classList.add('show'); bad = true; }
      if (!pwd) { $('#acPwd').classList.add('input-error'); bad = true; }
      if (bad) { UI.toast('请完善必填信息', 'error'); return; }

      const btn = body.querySelector('[data-bind]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.4);border-top-color:#fff"></span> 绑定中…';
      await mockApi(null, 800);

      Store.addAccount({
        email,
        displayName: $('#acName').value.trim() || email,
        type: presets[+$('#acType').value].type.replace(/（.*?）/, ''),
        smtp: $('#acSmtp').value.trim(),
        imap: $('#acImap').value.trim(),
        isDefault: false
      });
      m.close();
      UI.toast(`邮箱 ${email} 绑定成功`, 'success');
      this.render(container);
    });

    $('#acEmail').addEventListener('input', () => {
      $('#acEmail').classList.remove('input-error');
      $('#acEmailErr').classList.remove('show');
    });
  }
};
