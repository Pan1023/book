/* 邮件任务：列表 + 创建向导 */
window.Views = window.Views || {};

/* ---------------- 任务列表 ---------------- */
Views.campaigns = {
  statusFilter: 'all',

  render(container) {
    const s = Store.state;
    const list = s.campaigns.filter(c => this.statusFilter === 'all' || c.status === this.statusFilter);

    const summary = [
      { label: '进行中任务', value: s.campaigns.filter(c => c.status === 'sending').length, cls: 'ic-indigo' },
      { label: '定时待发', value: s.campaigns.filter(c => c.status === 'scheduled').length, cls: 'ic-sky' },
      { label: '累计发送', value: s.campaigns.reduce((a, c) => a + c.sent, 0).toLocaleString(), cls: 'ic-green' },
      { label: '累计回复', value: s.campaigns.reduce((a, c) => a + c.replied, 0), cls: 'ic-amber' }
    ];

    container.innerHTML = `
      <div class="page-head">
        <div>
          <div class="page-title">邮件任务</div>
          <div class="page-desc">批量邮件任务的创建、发送监控与合并统计</div>
        </div>
        <div class="page-head__actions">
          <button class="btn btn--ghost" id="cmpMergeBtn">
            <svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 3 5-6"/></svg>
            多任务合并报表
          </button>
          <button class="btn btn--primary" onclick="location.hash='#/campaigns/new'">
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            创建邮件任务
          </button>
        </div>
      </div>

      <div class="grid grid-4 mb-16">
        ${summary.map(k => `
          <div class="card kpi">
            <div class="kpi__top"><span class="kpi__label">${k.label}</span>
              <span class="kpi__icon ${k.cls}"><svg viewBox="0 0 24 24"><path d="M3 11l18-5v12L3 14v-3z"/></svg></span>
            </div>
            <div class="kpi__value">${k.value}</div>
          </div>`).join('')}
      </div>

      <div class="card">
        <div class="toolbar">
          ${[['all', '全部'], ['sending', '发送中'], ['scheduled', '定时中'], ['completed', '已完成'], ['draft', '草稿']]
            .map(([k, label]) => `<button class="filter-chip ${this.statusFilter === k ? 'active' : ''}" data-st="${k}">${label}</button>`).join('')}
          <div class="spacer"></div>
          <span style="font-size:12.5px;color:var(--text-3)">共 ${list.length} 个任务</span>
        </div>
        <div class="table-wrap">
          <table class="tbl">
            <thead><tr>
              <th>任务名称</th><th>状态</th><th style="width:180px">发送进度</th>
              <th>发送量</th><th>打开率</th><th>回复率</th><th>计划发送时间</th><th style="width:150px">操作</th>
            </tr></thead>
            <tbody>
              ${list.map(c => {
                const st = CAMPAIGN_STATUS[c.status];
                const openRate = c.delivered ? UI.pct(c.opened, c.delivered) + '%' : '—';
                const replyRate = c.delivered ? UI.pct(c.replied, c.delivered) + '%' : '—';
                return `<tr data-cmp-row="${c.id}">
                  <td>
                    <a href="#/campaigns/${c.id}" class="strong" style="color:var(--text-1)">${c.name}</a>
                    <div class="muted" style="font-size:12px;margin-top:2px">创建于 ${c.createdAt}</div>
                  </td>
                  <td><span class="badge ${st.badge}" data-cmp-status>${st.label}</span></td>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px">
                      <div class="progress" style="flex:1"><div class="progress__bar ${c.status === 'completed' ? 'progress__bar--green' : ''}" data-cmp-bar style="width:${c.progress}%"></div></div>
                      <span style="font-size:12px;font-weight:600;min-width:36px" data-cmp-pct>${c.progress}%</span>
                    </div>
                  </td>
                  <td><b data-cmp-sent>${c.sent.toLocaleString()}</b><span class="muted"> / ${c.total.toLocaleString()}</span></td>
                  <td data-cmp-open>${openRate}</td>
                  <td data-cmp-reply>${replyRate}</td>
                  <td class="muted" style="font-size:12.5px">${c.scheduleAt || '—'}</td>
                  <td>
                    <a class="btn btn--ghost btn--sm" href="#/campaigns/${c.id}">详情</a>
                    ${c.status === 'draft' ? `<button class="btn btn--ghost btn--sm" data-start="${c.id}">发布</button>` : ''}
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    container.querySelectorAll('[data-st]').forEach(b =>
      b.addEventListener('click', () => { this.statusFilter = b.dataset.st; this.render(container); }));

    container.querySelectorAll('[data-start]').forEach(b =>
      b.addEventListener('click', () => {
        const c = Store.getCampaign(b.dataset.start);
        Store.updateCampaign(c.id, { status: 'sending', scheduleAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') });
        UI.toast(`任务《${c.name}》已开始发送`, 'success');
        this.render(container);
      }));

    document.getElementById('cmpMergeBtn').addEventListener('click', () => this.openMergeModal());
  },

  /* 实时刷新（不整页重绘，避免打断用户操作） */
  refreshRealtime() {
    Store.state.campaigns.forEach(c => {
      const row = document.querySelector(`[data-cmp-row="${c.id}"]`);
      if (!row) return;
      const st = CAMPAIGN_STATUS[c.status];
      const badge = row.querySelector('[data-cmp-status]');
      if (badge) { badge.className = 'badge ' + st.badge; badge.textContent = st.label; }
      const bar = row.querySelector('[data-cmp-bar]');
      if (bar) {
        bar.style.width = c.progress + '%';
        bar.classList.toggle('progress__bar--green', c.status === 'completed');
      }
      const pct = row.querySelector('[data-cmp-pct]');
      if (pct) pct.textContent = c.progress + '%';
      const sent = row.querySelector('[data-cmp-sent]');
      if (sent) sent.textContent = c.sent.toLocaleString();
      const open = row.querySelector('[data-cmp-open]');
      if (open) open.textContent = c.delivered ? UI.pct(c.opened, c.delivered) + '%' : '—';
      const reply = row.querySelector('[data-cmp-reply]');
      if (reply) reply.textContent = c.delivered ? UI.pct(c.replied, c.delivered) + '%' : '—';
    });
  },

  openMergeModal() {
    const s = Store.state;
    const done = s.campaigns.filter(c => c.status === 'completed' || c.status === 'sending');
    const totals = done.reduce((acc, c) => {
      ['sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced'].forEach(k => acc[k] += c[k]);
      return acc;
    }, { sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0, bounced: 0 });

    const m = UI.modal({
      title: '多任务合并统计报表',
      size: 'lg',
      bodyHTML: `
        <p style="color:var(--text-3);font-size:13px;margin-bottom:16px">已合并 <b style="color:var(--text-1)">${done.length}</b> 个任务的数据（发送中 + 已完成）：</p>
        <div class="grid grid-4 mb-16">
          ${[['总发送', totals.sent, 'ic-indigo'], ['总送达', totals.delivered, 'ic-green'], ['总打开', totals.opened, 'ic-sky'], ['总回复', totals.replied, 'ic-amber']]
            .map(([l, v, cls]) => `<div class="card kpi"><div class="kpi__top"><span class="kpi__label">${l}</span><span class="kpi__icon ${cls}">●</span></div><div class="kpi__value">${v.toLocaleString()}</div></div>`).join('')}
        </div>
        <div class="card__title" style="margin-bottom:12px">合并转化漏斗</div>
        <div class="funnel">
          ${[['发送', totals.sent, '#6366f1'], ['送达', totals.delivered, '#0ea5e9'], ['打开', totals.opened, '#22c55e'], ['点击', totals.clicked, '#8b5cf6'], ['回复', totals.replied, '#f59e0b']]
            .map(([label, v, color], i, arr) => {
              const w = Math.max(8, (v / arr[0][1]) * 100);
              const rate = i === 0 ? '100%' : UI.pct(v, arr[i - 1][1]) + '%';
              return `<div class="funnel-row"><div class="funnel-row__label">${label}</div>
                <div class="funnel-row__track"><div class="funnel-row__fill" style="width:${w}%;background:${color}">${v.toLocaleString()}</div></div>
                <div class="funnel-row__pct">${rate}</div></div>`;
            }).join('')}
        </div>
        <div style="margin-top:14px;font-size:12.5px;color:var(--text-3)">
          综合送达率 <b style="color:var(--success)">${UI.pct(totals.delivered, totals.sent)}%</b> ·
          打开率 <b style="color:var(--info)">${UI.pct(totals.opened, totals.delivered)}%</b> ·
          回复率 <b style="color:var(--warning)">${UI.pct(totals.replied, totals.delivered)}%</b> ·
          退信率 <b style="color:var(--danger)">${UI.pct(totals.bounced, totals.sent)}%</b>
        </div>`,
      footer: () => `<button class="btn btn--ghost" data-close>关闭</button>
        <button class="btn btn--primary" id="mergeExport">
          <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          导出报表（CSV）
        </button>`
    });
    m.el.querySelector('#mergeExport').addEventListener('click', () => {
      UI.downloadCSV('多任务合并统计报表.csv', [
        ['指标', '数值', '比率'],
        ['总发送', totals.sent, '100%'],
        ['总送达', totals.delivered, UI.pct(totals.delivered, totals.sent) + '%'],
        ['总打开', totals.opened, UI.pct(totals.opened, totals.delivered) + '%'],
        ['总点击', totals.clicked, UI.pct(totals.clicked, totals.delivered) + '%'],
        ['总回复', totals.replied, UI.pct(totals.replied, totals.delivered) + '%'],
        ['总退信', totals.bounced, UI.pct(totals.bounced, totals.sent) + '%']
      ]);
      UI.toast('合并报表已导出', 'success');
    });
  }
};

/* ---------------- 创建任务向导 ---------------- */
Views['campaign-new'] = {
  step: 1,
  form: { name: '', accountId: '', template: '', recipients: [], subject: '', body: '', schedule: 'now', scheduleAt: '', retry: true },

  render(container) {
    const s = Store.state;
    const accounts = s.accounts.filter(a => a.status === 'connected');
    const tpls = s.templates || MOCK.templates;
    const f = this.form;

    const steps = ['基础信息', '导入收件人', '邮件内容', '发送设置'];

    container.innerHTML = `
      <div class="page-head">
        <div>
          <div class="page-title">创建邮件任务</div>
          <div class="page-desc">四步完成批量邮件任务创建，发送过程自动追踪送达 / 打开 / 点击 / 回复</div>
        </div>
      </div>

      <div class="card">
        <div class="card__body">
          <div class="steps">
            ${steps.map((label, i) => {
              const n = i + 1;
              const cls = n === this.step ? 'active' : n < this.step ? 'done' : '';
              return `<div class="step ${cls}">
                <div class="step__dot">${n < this.step ? '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>' : n}</div>
                <div class="step__label">${label}</div>
                ${n < steps.length ? '<div class="step__line"></div>' : ''}
              </div>`;
            }).join('')}
          </div>

          <div id="wizardBody" style="max-width:680px;margin:0 auto;min-height:340px"></div>

          <div style="display:flex;justify-content:space-between;max-width:680px;margin:24px auto 0">
            <button class="btn btn--ghost" id="wzPrev" ${this.step === 1 ? 'disabled' : ''}>上一步</button>
            <button class="btn btn--primary" id="wzNext">${this.step === 4 ? '🚀 创建并发送任务' : '下一步'}</button>
          </div>
        </div>
      </div>`;

    const body = () => document.getElementById('wizardBody');

    const renderStep = () => {
      container.querySelectorAll('.step').forEach((el, i) => {
        const n = i + 1;
        el.className = 'step ' + (n === this.step ? 'active' : n < this.step ? 'done' : '');
      });
      document.getElementById('wzPrev').disabled = this.step === 1;
      document.getElementById('wzNext').innerHTML = this.step === 4
        ? '<svg viewBox="0 0 24 24"><path d="M3 11l18-5v12L3 14v-3z"/></svg> 创建并发送任务' : '下一步 →';
      drawStep();
    };

    const drawStep = () => {
      const el = body();
      if (this.step === 1) {
        el.innerHTML = `
          <div class="form-row">
            <label class="form-label">任务名称<span class="req">*</span></label>
            <input class="input" id="fName" placeholder="如：10 月新产品推广邮件" value="${f.name}"/>
          </div>
          <div class="form-row">
            <label class="form-label">发件邮箱<span class="req">*</span></label>
            <select class="select" id="fAccount">
              ${accounts.map(a => `<option value="${a.id}" ${f.accountId === a.id ? 'selected' : ''}>${a.email}（${a.type}）</option>`).join('')}
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">套用邮件模板</label>
            <select class="select" id="fTpl">
              <option value="">不使用模板（稍后手动编辑）</option>
              ${tpls.map(t => `<option value="${t.id}" ${f.template === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
            </select>
            <div class="form-hint">选择模板后，第 3 步将自动填充主题与正文，可继续编辑</div>
          </div>`;
      }
      if (this.step === 2) {
        el.innerHTML = `
          <div class="form-row">
            <label class="form-label">批量导入收件人<span class="req">*</span></label>
            <div class="import-drop" id="importCsv">
              <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <div style="font-weight:600;color:var(--text-2)">点击上传 CSV / Excel 文件（模拟）</div>
              <div style="font-size:12px;margin-top:4px">支持字段：姓名、邮箱、公司；单次最多 5,000 条</div>
            </div>
          </div>
          <div class="form-row">
            <label class="form-label">或手动粘贴邮箱列表（每行一个，可带姓名）</label>
            <textarea class="textarea" id="fRecipients" style="min-height:150px" placeholder="李娜,lina@brightfuture.com,光明未来科技&#10;wangqiang@techstar.io&#10;孙浩 <sunhao@finance360.cn>"></textarea>
          </div>
          <div id="parseResult"></div>`;
        const ta = el.querySelector('#fRecipients');
        const refresh = () => {
          f.recipients = parseRecipients(ta.value);
          const valid = f.recipients.filter(r => r.valid);
          const invalid = f.recipients.length - valid.length;
          el.querySelector('#parseResult').innerHTML = f.recipients.length ? `
            <div style="display:flex;gap:10px;align-items:center;font-size:13px">
              <span class="badge badge--green">有效 ${valid.length} 条</span>
              ${invalid ? `<span class="badge badge--red">格式错误 ${invalid} 条</span>` : '<span class="badge badge--gray">格式校验全部通过</span>'}
            </div>` : '';
        };
        ta.addEventListener('input', refresh);
        ta.value = f._rawRecipients || '';
        refresh();
        el.querySelector('#importCsv').addEventListener('click', () => {
          const sample = [
            '李娜,lina@brightfuture.com,光明未来科技',
            '王强,wangqiang@techstar.io,TechStar',
            '孙浩,sunhao@finance360.cn,金融360',
            '吴刚,wugang@manufacture-pro.com,精工制造',
            '周婷,zhouting@edu-star.edu,星辰教育',
            '林峰,linfeng@smartcity.gov,智慧城市研究院',
            '徐丽,xuli@fashion-now.com,时尚前线',
            '冯磊,fenglei@medcare.cn,康护医疗',
            '何静,hejing@logistics8.com,八方物流',
            'bad-email-001,xxx@,错误公司',
            '刘洋,liuyang@cloudwave.com,云浪科技'
          ];
          ta.value = sample.join('\n');
          refresh();
          UI.toast('已导入 recipients_demo.csv，共 11 条（模拟）', 'success');
        });
      }
      if (this.step === 3) {
        el.innerHTML = `
          <div class="form-row">
            <label class="form-label">邮件主题<span class="req">*</span></label>
            <input class="input" id="fSubject" value="${f.subject}" placeholder="一句话吸引打开，避免使用垃圾邮件敏感词"/>
          </div>
          <div class="form-row">
            <label class="form-label">邮件正文（富文本）<span class="req">*</span></label>
            <div style="border:1px solid var(--border-strong);border-radius:10px;overflow:hidden">
              <div class="editor-toolbar" style="position:static">
                <button data-cmd="bold"><b>加粗</b></button>
                <button data-cmd="italic"><i>斜体</i></button>
                <button data-cmd="underline"><u>下划线</u></button>
                <span class="sep"></span>
                <button data-cmd="insertUnorderedList">列表</button>
                <button data-cmd="createLink">插入链接</button>
              </div>
              <div class="editor-area" id="fBody" contenteditable="true" style="min-height:220px" data-placeholder="撰写批量邮件正文，系统将自动插入追踪像素与链接埋点…">${f.body}</div>
            </div>
            <div class="form-hint">📊 系统将自动在邮件中插入打开追踪像素，并对链接重写以统计点击；回复邮件自动进入统一收件箱</div>
          </div>`;
        const ed = el.querySelector('#fBody');
        el.querySelectorAll('[data-cmd]').forEach(b => b.addEventListener('click', () => {
          ed.focus();
          if (b.dataset.cmd === 'createLink') {
            const url = prompt('输入链接地址：', 'https://');
            if (url) document.execCommand('createLink', false, url);
          } else document.execCommand(b.dataset.cmd, false, null);
        }));
      }
      if (this.step === 4) {
        el.innerHTML = `
          <div class="form-row">
            <label class="form-label">发送时间</label>
            <div style="display:flex;gap:20px;margin-bottom:8px">
              <label style="display:flex;gap:8px;align-items:center;cursor:pointer;font-size:13.5px">
                <input type="radio" name="sch" value="now" ${f.schedule === 'now' ? 'checked' : ''}/> 立即发送
              </label>
              <label style="display:flex;gap:8px;align-items:center;cursor:pointer;font-size:13.5px">
                <input type="radio" name="sch" value="later" ${f.schedule === 'later' ? 'checked' : ''}/> 定时发送
              </label>
            </div>
            <input type="datetime-local" class="input" id="fScheduleAt" value="${f.scheduleAt}" ${f.schedule === 'now' ? 'disabled' : ''}/>
          </div>
          <div class="form-row">
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer">
              <span class="switch"><input type="checkbox" id="fRetry" ${f.retry ? 'checked' : ''}/><span class="switch__slider"></span></span>
              <span style="font-size:13.5px">开启失败自动重试（最多 3 次，间隔 5/15/60 分钟）</span>
            </label>
          </div>
          <div class="card" style="background:#f9fafb">
            <div class="card__body">
              <div class="card__title" style="font-size:14px;margin-bottom:10px">任务确认</div>
              <div class="stat-line"><span class="sl-label">任务名称</span><span class="sl-value">${f.name || '—'}</span></div>
              <div class="stat-line"><span class="sl-label">收件人数</span><span class="sl-value">${f.recipients.filter(r => r.valid).length} 人${f.recipients.some(r => !r.valid) ? `（${f.recipients.filter(r => !r.valid).length} 条无效将跳过）` : ''}</span></div>
              <div class="stat-line"><span class="sl-label">邮件主题</span><span class="sl-value" style="max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.subject || '—'}</span></div>
              <div class="stat-line"><span class="sl-label">发送方式</span><span class="sl-value">${f.schedule === 'now' ? '立即发送' : '定时：' + (f.scheduleAt || '未设置')}</span></div>
            </div>
          </div>`;
        el.querySelectorAll('[name=sch]').forEach(r => r.addEventListener('change', () => {
          f.schedule = r.value;
          el.querySelector('#fScheduleAt').disabled = r.value === 'now';
        }));
      }
    };

    const collect = () => {
      if (this.step === 1) {
        f.name = document.getElementById('fName').value.trim();
        f.accountId = document.getElementById('fAccount').value;
        f.template = document.getElementById('fTpl').value;
        if (!f.name) { UI.toast('请填写任务名称', 'error'); return false; }
        if (f.template) {
          const tpl = (s.templates || MOCK.templates).find(t => t.id === f.template);
          if (tpl && !f.subject) { f.subject = tpl.subject; f.body = tpl.body; }
        }
      }
      if (this.step === 2) {
        f._rawRecipients = document.getElementById('fRecipients').value;
        f.recipients = parseRecipients(f._rawRecipients);
        if (!f.recipients.some(r => r.valid)) { UI.toast('请至少导入一个有效收件人邮箱', 'error'); return false; }
      }
      if (this.step === 3) {
        f.subject = document.getElementById('fSubject').value.trim();
        f.body = document.getElementById('fBody').innerHTML;
        if (!f.subject || !document.getElementById('fBody').innerText.trim()) { UI.toast('请填写邮件主题和正文', 'error'); return false; }
      }
      if (this.step === 4) {
        f.scheduleAt = el_scheduleAt();
        if (f.schedule === 'later' && !f.scheduleAt) { UI.toast('请选择定时发送时间', 'error'); return false; }
        f.retry = document.getElementById('fRetry').checked;
      }
      return true;
    };
    const el_scheduleAt = () => { const x = document.getElementById('fScheduleAt'); return x ? x.value : ''; };

    document.getElementById('wzPrev').addEventListener('click', () => { if (collect() || this.step > 1) { this.step--; renderStep(); } });
    document.getElementById('wzNext').addEventListener('click', async () => {
      if (!collect()) return;
      if (this.step < 4) { this.step++; renderStep(); return; }
      // 提交
      const btn = document.getElementById('wzNext');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.4);border-top-color:#fff"></span> 正在创建任务…';
      await mockApi(null, 1000);

      const validCount = f.recipients.filter(r => r.valid).length;
      const cmp = Store.addCampaign({
        name: f.name,
        template: f.template || null,
        fromAccount: f.accountId,
        status: f.schedule === 'now' ? 'sending' : 'scheduled',
        total: validCount,
        sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0, bounced: 0,
        scheduleAt: f.schedule === 'now' ? new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') : f.scheduleAt.replace('T', ' '),
        progress: 0,
        subject: f.subject
      });
      UI.toast(f.schedule === 'now' ? `任务已创建，开始向 ${validCount} 位收件人发送` : '定时任务已创建，将按计划时间发送', 'success', 3200);
      this.step = 1;
      this.form = { name: '', accountId: '', template: '', recipients: [], subject: '', body: '', schedule: 'now', scheduleAt: '', retry: true };
      location.hash = '#/campaigns/' + cmp.id;
    });

    drawStep();
  }
};

/* 解析收件人文本：支持 "姓名,邮箱,公司" / "邮箱" / "姓名 <邮箱>" */
function parseRecipients(text) {
  const emailRe = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  return text.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
    const match = line.match(emailRe);
    if (!match) return { name: '', email: line, company: '', valid: false };
    const email = match[0];
    let name = line.replace(/[<>]/g, '').split(email)[0].replace(/[,，]/g, '').trim() || email.split('@')[0];
    let company = line.split(',').length >= 3 ? line.split(',').pop().trim() : '';
    if (line.includes(',')) {
      const parts = line.split(',').map(x => x.trim());
      if (parts[0] && !parts[0].includes('@')) name = parts[0];
      if (parts[2]) company = parts[2];
    }
    return { name, email, company, valid: true };
  });
}
