/* ==========================================================================
   应用入口 · 路由 · 顶栏 · 发送模拟
   ========================================================================== */

const App = (() => {
  const routes = [
    { name: 'dashboard',     pattern: /^#\/dashboard$/,        title: '数据看板' },
    { name: 'inbox',         pattern: /^#\/inbox$/,            title: '统一收件箱' },
    { name: 'contacts',      pattern: /^#\/contacts$/,         title: '联系人会话' },
    { name: 'accounts',      pattern: /^#\/accounts$/,         title: '邮箱账号绑定' },
    { name: 'campaign-new',  pattern: /^#\/campaigns\/new$/,   title: '创建邮件任务' },
    { name: 'campaign-detail', pattern: /^#\/campaigns\/(.+)$/, title: '任务详情' },
    { name: 'campaigns',     pattern: /^#\/campaigns$/,        title: '邮件任务' },
    { name: 'analytics',     pattern: /^#\/analytics$/,        title: '数据分析' },
    { name: 'leads',         pattern: /^#\/leads$/,            title: '意向客户' }
  ];

  let currentRoute = null;

  function parseHash() {
    const hash = location.hash || '#/dashboard';
    for (const r of routes) {
      const m = hash.match(r.pattern);
      if (m) return { name: r.name, params: { id: m[1] }, title: r.title };
    }
    return { name: 'dashboard', params: {}, title: '数据看板' };
  }

  function navigate(hash) {
    if (hash) location.hash = hash;
    else render();
  }

  function rerender() { render(); }

  function render() {
    const route = parseHash();
    currentRoute = route;
    const view = Views[route.name];
    const container = document.getElementById('view');
    container.innerHTML = '';
    view.render(container, route.params);
    updateNav(route.name);
    // 移动端切换页面后收起侧边栏
    document.getElementById('sidebar').classList.remove('open');
    window.scrollTo(0, 0);
  }

  function updateNav(routeName) {
    // 详情页高亮「邮件任务」
    const navKey = routeName === 'campaign-detail' ? 'campaigns' : routeName;
    document.querySelectorAll('.nav-item').forEach(a => {
      a.classList.toggle('active', a.dataset.route === navKey);
    });
  }

  function refreshBadges() {
    const inbox = document.getElementById('inboxBadge');
    const n = Store.unreadCount();
    inbox.textContent = n;
    inbox.style.display = n > 0 ? 'inline-flex' : 'none';
  }

  /* ---------- 顶栏 ---------- */
  function initTopbar() {
    // 账号切换
    const menu = document.getElementById('accountSelectMenu');
    const accounts = Store.state.accounts;
    menu.innerHTML =
      `<button class="ts-menu__item active" data-acc="all"><span class="dot dot--green"></span> 全部邮箱（${accounts.length}）</button>` +
      accounts.map(a =>
        `<button class="ts-menu__item" data-acc="${a.id}"><span class="dot ${a.status === 'connected' ? 'dot--green' : a.status === 'error' ? 'dot--red' : 'dot--gray'}"></span> ${a.email}</button>`
      ).join('');

    document.getElementById('accountSelectBtn').addEventListener('click', e => {
      e.stopPropagation();
      menu.classList.toggle('open');
      document.getElementById('bellPanel').classList.remove('open');
    });
    menu.querySelectorAll('[data-acc]').forEach(b => b.addEventListener('click', () => {
      menu.querySelectorAll('[data-acc]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const label = b.textContent.trim();
      document.getElementById('currentAccountLabel').textContent = label.length > 18 ? label.slice(0, 16) + '…' : label;
      menu.classList.remove('open');
      if (b.dataset.acc !== 'all') {
        UI.toast(`已切换查看邮箱：${label}（演示）`, 'info', 1800);
      }
    }));

    // 通知铃铛
    const bellPanel = document.getElementById('bellPanel');
    const drawBell = () => {
      bellPanel.innerHTML = `
        <div class="bell-panel__head">通知中心
          <span class="tag tag--indigo">${Store.state.notifications.length} 条未读</span>
        </div>
        <div class="bell-panel__list">
          ${Store.state.notifications.map(n => `
            <div class="bell-item">
              <div class="bell-item__icon ${n.color}">
                <svg viewBox="0 0 24 24">${iconPath(n.icon)}</svg>
              </div>
              <div>
                <div class="bell-item__text">${n.text}</div>
                <div class="bell-item__time">${n.time}</div>
              </div>
            </div>`).join('')}
        </div>`;
    };
    drawBell();
    document.getElementById('bellBtn').addEventListener('click', e => {
      e.stopPropagation();
      bellPanel.classList.toggle('open');
      menu.classList.remove('open');
      if (bellPanel.classList.contains('open')) {
        document.querySelector('.bell-dot').style.display = 'none';
      }
    });
    document.addEventListener('click', () => {
      bellPanel.classList.remove('open');
      menu.classList.remove('open');
    });

    // 全局搜索 → 跳转收件箱
    document.getElementById('globalSearch').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const kw = e.target.value.trim();
        if (Views.inbox) Views.inbox.keyword = kw;
        location.hash = '#/inbox';
        e.target.value = '';
      }
    });

    // 快速写信
    document.getElementById('quickComposeBtn').addEventListener('click', () => openComposeModal());

    // 移动端菜单
    document.getElementById('menuToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
  }

  /* ---------- 发送进度实时模拟（发送中任务自动推进） ---------- */
  function initSendingSimulator() {
    setInterval(() => {
      const sending = Store.state.campaigns.filter(c => c.status === 'sending' && c.progress < 100);
      if (!sending.length) return;
      let changed = false;

      sending.forEach(c => {
        c.progress = Math.min(100, c.progress + 2 + Math.floor(Math.random() * 4));
        c.sent = Math.round(c.total * c.progress / 100);
        c.delivered = Math.round(c.sent * 0.97);
        c.opened = Math.round(c.delivered * 0.46);
        c.clicked = Math.round(c.delivered * 0.17);
        c.replied = Math.round(c.delivered * 0.075);
        c.bounced = c.sent - c.delivered;
        changed = true;
        if (c.progress >= 100) {
          c.status = 'completed';
          setTimeout(() => UI.toast(`任务《${c.name}》已全部发送完成`, 'success', 3200), 400);
        }
      });

      if (changed) {
        Store.save();
        // 仅局部刷新进度数据，避免整页重绘打断用户操作
        if (currentRoute && currentRoute.name === 'campaigns' && Views.campaigns.refreshRealtime) {
          Views.campaigns.refreshRealtime();
        } else if (currentRoute && currentRoute.name === 'campaign-detail' && Views['campaign-detail'].refreshRealtime) {
          Views['campaign-detail'].refreshRealtime(currentRoute.params.id);
        }
      }
    }, 2500);
  }

  function init() {
    initTopbar();
    refreshBadges();
    initSendingSimulator();
    window.addEventListener('hashchange', () => { render(); refreshBadges(); });
    if (!location.hash) location.hash = '#/dashboard';
    render();
  }

  return { init, navigate, rerender, refreshBadges };
})();

document.addEventListener('DOMContentLoaded', App.init);
