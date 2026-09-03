/* ==========================================================================
   Mock 数据 · 邮件中心演示
   说明：所有数据均为前端模拟，localStorage 持久化用户操作产生的变更
   ========================================================================== */

const MOCK = {

  /* ---------- 已绑定邮箱账号 ---------- */
  accounts: [
    {
      id: 'acc-1',
      email: 'zhangwei@acme-corp.com',
      displayName: '张伟（企业邮箱）',
      type: '企业邮箱',
      smtp: 'smtp.exmail.qq.com',
      imap: 'imap.exmail.qq.com',
      status: 'connected',   // connected | error | disabled
      isDefault: true,
      boundAt: '2026-07-15'
    },
    {
      id: 'acc-2',
      email: 'zhangwei.sales@gmail.com',
      displayName: '张伟（Gmail）',
      type: 'Gmail',
      smtp: 'smtp.gmail.com',
      imap: 'imap.gmail.com',
      status: 'connected',
      isDefault: false,
      boundAt: '2026-08-02'
    },
    {
      id: 'acc-3',
      email: 'sales01@acme-corp.com',
      displayName: '销售一组公用邮箱',
      type: '企业邮箱',
      smtp: 'smtp.exmail.qq.com',
      imap: 'imap.exmail.qq.com',
      status: 'error',
      isDefault: false,
      boundAt: '2026-06-20'
    }
  ],

  /* ---------- 邮件模板 ---------- */
  templates: [
    {
      id: 'tpl-1',
      name: '初次触达 · 产品介绍',
      subject: '{{客户名}} 您好，Acme 智能客服解决方案介绍',
      body: '<p>{{客户名}} 您好：</p><p>我是 Acme 公司的张伟，了解到贵公司正在关注客户服务效率提升，我们的智能客服系统已帮助 200+ 企业将响应时间缩短 60%。</p><p>不知您本周是否有 15 分钟时间，我做个简短介绍？</p><p>祝好<br/>张伟</p>'
    },
    {
      id: 'tpl-2',
      name: '跟进 · 报价单发送',
      subject: '{{客户名}}，这是您关注的方案报价',
      body: '<p>{{客户名}} 您好：</p><p>根据上次沟通，附上为贵公司定制的方案与报价（见附件）。<b>本月签约可享 8.5 折优惠</b>。</p><p>如有任何疑问，欢迎随时联系。</p><p>张伟<br/>Acme 公司</p>'
    },
    {
      id: 'tpl-3',
      name: '展会邀请函',
      subject: '诚邀参加 Acme 2026 秋季产品发布会',
      body: '<p>{{客户名}} 您好：</p><p>Acme 2026 秋季产品发布会将于 9 月 20 日在上海国际会议中心举行，届时将发布全新一代智能营销平台。</p><p>诚邀您拨冗出席，<b>回复本邮件即可完成报名</b>。</p><p>期待与您见面！</p>'
    },
    {
      id: 'tpl-4',
      name: '节日问候',
      subject: '中秋快乐，感谢一路同行',
      body: '<p>{{客户名}} 您好：</p><p>值此中秋佳节，感谢您一直以来的信任与支持。祝您与家人阖家团圆、幸福安康！</p><p>—— Acme 团队 敬上</p>'
    }
  ],

  /* ---------- 收件箱邮件（按会话聚合，最新在前） ---------- */
  emails: [
    {
      id: 'm-1',
      contactId: 'c-1',
      fromName: '李娜',
      fromEmail: 'lina@brightfuture.com',
      to: 'zhangwei@acme-corp.com',
      accountId: 'acc-1',
      subject: 'Re: 智能客服方案报价 —— 希望安排试用',
      preview: '张经理您好，报价已收到，我们内部讨论后对专业版很感兴趣，希望能先安排一周的试用…',
      time: '2026-09-03 09:42',
      ts: Date.now() - 2 * 3600e3,
      unread: true,
      starred: true,
      hasAttachment: false,
      folder: 'inbox',
      body: [
        { from: 'me', name: '张伟', email: 'zhangwei@acme-corp.com', time: '2026-09-02 16:20',
          content: '<p>李娜女士您好：</p><p>根据上周的演示沟通，附上为贵公司定制的智能客服专业版方案与报价。期待您的反馈！</p>' },
        { from: 'them', name: '李娜', email: 'lina@brightfuture.com', time: '2026-09-03 09:42',
          content: '<p>张经理您好：</p><p>报价已收到，我们内部讨论后对<b>专业版</b>很感兴趣，希望能先安排一周的试用，另外想确认一下：</p><p>1. 试用期是否包含 API 对接支持？<br/>2. 200 坐席以上是否有进一步折扣？</p><p>期待您的回复。</p>' }
      ]
    },
    {
      id: 'm-2',
      contactId: 'c-2',
      fromName: '王强',
      fromEmail: 'wangqiang@techstar.io',
      to: 'zhangwei.sales@gmail.com',
      accountId: 'acc-2',
      subject: 'Re: 秋季产品发布会报名',
      preview: '张伟你好，发布会我和我们市场总监刘总都会参加，请问现场有对接 CRM 的专场演示吗…',
      time: '2026-09-03 08:15',
      ts: Date.now() - 5 * 3600e3,
      unread: true,
      starred: false,
      hasAttachment: false,
      folder: 'inbox',
      body: [
        { from: 'me', name: '张伟', email: 'zhangwei.sales@gmail.com', time: '2026-09-01 10:05',
          content: '<p>王总您好，Acme 秋季发布会 9 月 20 日举行，诚邀您参加，回复本邮件即可报名。</p>' },
        { from: 'them', name: '王强', email: 'wangqiang@techstar.io', time: '2026-09-03 08:15',
          content: '<p>张伟你好：</p><p>发布会我和我们市场总监刘总都会参加，请问现场有 <b>CRM 对接</b>的专场演示吗？我们目前在用 Salesforce，希望了解集成方案。</p>' }
      ]
    },
    {
      id: 'm-3',
      contactId: 'c-3',
      fromName: '陈静',
      fromEmail: 'chenjing@lenovo-mall.cn',
      to: 'zhangwei@acme-corp.com',
      accountId: 'acc-1',
      subject: '合同已盖章回传，请查收',
      preview: '张经理，合同一式两份已盖章扫描，见附件。请安排后续开通流程，谢谢！',
      time: '2026-09-02 17:58',
      ts: Date.now() - 18 * 3600e3,
      unread: true,
      starred: true,
      hasAttachment: true,
      attachments: [{ name: 'Acme服务合同_已盖章.pdf', size: '2.4 MB' }],
      folder: 'inbox',
      body: [
        { from: 'them', name: '陈静', email: 'chenjing@lenovo-mall.cn', time: '2026-09-02 17:58',
          content: '<p>张经理您好：</p><p>合同一式两份已盖章扫描，见附件。请安排后续开通流程，谢谢！</p><p>陈静</p>' }
      ]
    },
    {
      id: 'm-4',
      contactId: 'c-4',
      fromName: '刘洋',
      fromEmail: 'liuyang@cloudwave.com',
      to: 'zhangwei@acme-corp.com',
      accountId: 'acc-1',
      subject: 'Re: 关于智能营销平台的合作',
      preview: '谢谢介绍，我们目前预算在 Q4 才会批，到时再联系可以吗？另外先把产品资料发我一份…',
      time: '2026-09-02 14:30',
      ts: Date.now() - 30 * 3600e3,
      unread: false,
      starred: false,
      hasAttachment: false,
      folder: 'inbox',
      body: [
        { from: 'me', name: '张伟', email: 'zhangwei@acme-corp.com', time: '2026-09-01 09:00',
          content: '<p>刘总您好，向您介绍我们的智能营销平台……</p>' },
        { from: 'them', name: '刘洋', email: 'liuyang@cloudwave.com', time: '2026-09-02 14:30',
          content: '<p>谢谢介绍，我们目前预算在 Q4 才会批，到时再联系可以吗？另外先把产品资料发我一份留存。</p>' }
      ]
    },
    {
      id: 'm-5',
      contactId: 'c-5',
      fromName: '赵敏',
      fromEmail: 'zhaomin@retailking.com',
      to: 'zhangwei.sales@gmail.com',
      accountId: 'acc-2',
      subject: '邮件退信通知：地址不存在',
      preview: '您发送的邮件无法送达，收件地址 zhaomin@retailking.com 不存在（550 Mailbox not found）…',
      time: '2026-09-02 11:05',
      ts: Date.now() - 40 * 3600e3,
      unread: false,
      starred: false,
      hasAttachment: false,
      folder: 'inbox',
      bounce: true,
      body: [
        { from: 'them', name: '邮件系统', email: 'mailer-daemon@gmail.com', time: '2026-09-02 11:05',
          content: '<p>您发送的邮件无法送达：</p><p>收件地址 <b>zhaomin@retailking.com</b> 不存在（550 Mailbox not found），系统将自动标记该地址并停止后续发送。</p>' }
      ]
    },
    {
      id: 'm-6',
      contactId: 'c-6',
      fromName: '孙浩',
      fromEmail: 'sunhao@finance360.cn',
      to: 'zhangwei@acme-corp.com',
      accountId: 'acc-1',
      subject: 'Re: 方案演示会议纪要确认',
      preview: '会议纪要已确认，没有问题。下周我们采购委员会评审后给你答复。',
      time: '2026-09-01 19:22',
      ts: Date.now() - 64 * 3600e3,
      unread: false,
      starred: true,
      hasAttachment: false,
      folder: 'inbox',
      body: [
        { from: 'me', name: '张伟', email: 'zhangwei@acme-corp.com', time: '2026-09-01 10:00',
          content: '<p>孙总，这是昨天演示会议的纪要，请确认。</p>' },
        { from: 'them', name: '孙浩', email: 'sunhao@finance360.cn', time: '2026-09-01 19:22',
          content: '<p>会议纪要已确认，没有问题。下周我们采购委员会评审后给你答复。</p>' }
      ]
    },
    {
      id: 'm-7',
      contactId: 'c-7',
      fromName: '周婷',
      fromEmail: 'zhouting@edu-star.edu',
      to: 'zhangwei@acme-corp.com',
      accountId: 'acc-1',
      subject: '咨询教育行业版本功能',
      preview: '您好，我们是一家连锁教育机构，想了解系统是否支持学员自动分班通知和家校沟通场景…',
      time: '2026-09-01 15:40',
      ts: Date.now() - 70 * 3600e3,
      unread: false,
      starred: false,
      hasAttachment: false,
      folder: 'inbox',
      body: [
        { from: 'them', name: '周婷', email: 'zhouting@edu-star.edu', time: '2026-09-01 15:40',
          content: '<p>您好，我们是一家连锁教育机构，想了解系统是否支持学员自动分班通知和家校沟通场景？规模大约 5 万学员。</p>' }
      ]
    },
    {
      id: 'm-8',
      contactId: 'c-8',
      fromName: '吴刚',
      fromEmail: 'wugang@manufacture-pro.com',
      to: 'zhangwei.sales@gmail.com',
      accountId: 'acc-2',
      subject: 'Re: 中秋问候',
      preview: '谢谢张伟！也祝你们团队中秋快乐，节后我们约个时间聊聊二期扩容的事。',
      time: '2026-08-31 09:10',
      ts: Date.now() - 96 * 3600e3,
      unread: false,
      starred: false,
      hasAttachment: false,
      folder: 'inbox',
      body: [
        { from: 'me', name: '张伟', email: 'zhangwei.sales@gmail.com', time: '2026-08-30 17:30',
          content: '<p>吴总，中秋快乐，感谢一路同行！</p>' },
        { from: 'them', name: '吴刚', email: 'wugang@manufacture-pro.com', time: '2026-08-31 09:10',
          content: '<p>谢谢张伟！也祝你们团队中秋快乐，节后我们约个时间聊聊<b>二期扩容</b>的事。</p>' }
      ]
    },
    {
      id: 'm-9',
      contactId: 'c-2',
      fromName: '王强',
      fromEmail: 'wangqiang@techstar.io',
      to: 'zhangwei.sales@gmail.com',
      accountId: 'acc-2',
      subject: 'Re: 智能客服解决方案介绍',
      preview: '资料看了，思路不错。我们团队约 80 人，下周二下午方便电话吗？',
      time: '2026-08-30 11:26',
      ts: Date.now() - 120 * 3600e3,
      unread: false,
      starred: false,
      hasAttachment: false,
      folder: 'inbox',
      body: [
        { from: 'me', name: '张伟', email: 'zhangwei.sales@gmail.com', time: '2026-08-29 14:00',
          content: '<p>王总您好，我是 Acme 的张伟……</p>' },
        { from: 'them', name: '王强', email: 'wangqiang@techstar.io', time: '2026-08-30 11:26',
          content: '<p>资料看了，思路不错。我们团队约 80 人，下周二下午方便电话吗？</p>' }
      ]
    }
  ],

  /* ---------- 联系人（会话归档） ---------- */
  contacts: [
    { id: 'c-1', name: '李娜', email: 'lina@brightfuture.com', company: '光明未来科技', avatar: 'indigo', threadCount: 12, lastActive: '2026-09-03', tags: ['高意向', '专业版'], intent: 92 },
    { id: 'c-2', name: '王强', email: 'wangqiang@techstar.io', company: 'TechStar', avatar: 'sky', threadCount: 8, lastActive: '2026-09-03', tags: ['高意向', '发布会报名'], intent: 88 },
    { id: 'c-3', name: '陈静', email: 'chenjing@lenovo-mall.cn', company: '联想商城', avatar: 'green', threadCount: 15, lastActive: '2026-09-02', tags: ['已成交', '合同回签'], intent: 95 },
    { id: 'c-4', name: '刘洋', email: 'liuyang@cloudwave.com', company: '云浪科技', avatar: 'amber', threadCount: 5, lastActive: '2026-09-02', tags: ['待跟进', 'Q4预算'], intent: 55 },
    { id: 'c-5', name: '赵敏', email: 'zhaomin@retailking.com', company: '零售王', avatar: 'rose', threadCount: 2, lastActive: '2026-09-02', tags: ['退信地址'], intent: 10 },
    { id: 'c-6', name: '孙浩', email: 'sunhao@finance360.cn', company: '金融360', avatar: 'violet', threadCount: 9, lastActive: '2026-09-01', tags: ['高意向', '采购评审中'], intent: 80 },
    { id: 'c-7', name: '周婷', email: 'zhouting@edu-star.edu', company: '星辰教育', avatar: 'teal', threadCount: 1, lastActive: '2026-09-01', tags: ['新线索', '教育行业'], intent: 62 },
    { id: 'c-8', name: '吴刚', email: 'wugang@manufacture-pro.com', company: '精工制造', avatar: 'indigo', threadCount: 18, lastActive: '2026-08-31', tags: ['老客户', '二期扩容'], intent: 78 }
  ],

  /* ---------- 邮件任务（批量营销） ---------- */
  campaigns: [
    {
      id: 'cmp-1',
      name: 'Q3 新产品推广 · 智能营销平台',
      template: 'tpl-1',
      fromAccount: 'acc-1',
      status: 'completed',   // draft | scheduled | sending | completed
      total: 1280,
      sent: 1280,
      delivered: 1242,
      opened: 538,
      clicked: 186,
      replied: 74,
      bounced: 38,
      createdAt: '2026-08-18',
      scheduleAt: '2026-08-20 10:00',
      progress: 100
    },
    {
      id: 'cmp-2',
      name: '2026 秋季发布会邀请函',
      template: 'tpl-3',
      fromAccount: 'acc-2',
      status: 'sending',
      total: 860,
      sent: 512,
      delivered: 498,
      opened: 210,
      clicked: 96,
      replied: 41,
      bounced: 14,
      createdAt: '2026-09-01',
      scheduleAt: '2026-09-02 09:30',
      progress: 60
    },
    {
      id: 'cmp-3',
      name: '客户满意度回访（老客户）',
      template: null,
      fromAccount: 'acc-1',
      status: 'scheduled',
      total: 420,
      sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0, bounced: 0,
      createdAt: '2026-09-02',
      scheduleAt: '2026-09-08 10:00',
      progress: 0
    },
    {
      id: 'cmp-4',
      name: '中秋节日问候',
      template: 'tpl-4',
      fromAccount: 'acc-1',
      status: 'completed',
      total: 960,
      sent: 960,
      delivered: 941,
      opened: 612,
      clicked: 58,
      replied: 123,
      bounced: 19,
      createdAt: '2026-08-25',
      scheduleAt: '2026-08-28 09:00',
      progress: 100
    },
    {
      id: 'cmp-5',
      name: '沉睡客户唤醒 · 7月未触达',
      template: null,
      fromAccount: 'acc-2',
      status: 'draft',
      total: 350,
      sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0, bounced: 0,
      createdAt: '2026-09-03',
      scheduleAt: '',
      progress: 0
    }
  ],

  /* ---------- 任务收件人明细（以 cmp-2 为例，其余任务演示复用） ---------- */
  recipients: [
    { id: 'r-1', name: '李娜', email: 'lina@brightfuture.com', company: '光明未来科技', status: 'replied', openCount: 4, lastEvent: '2026-09-03 09:42 回复邮件' },
    { id: 'r-2', name: '王强', email: 'wangqiang@techstar.io', company: 'TechStar', status: 'replied', openCount: 3, lastEvent: '2026-09-03 08:15 回复邮件' },
    { id: 'r-3', name: '孙浩', email: 'sunhao@finance360.cn', company: '金融360', status: 'opened', openCount: 2, lastEvent: '2026-09-02 15:30 打开邮件' },
    { id: 'r-4', name: '吴刚', email: 'wugang@manufacture-pro.com', company: '精工制造', status: 'clicked', openCount: 5, lastEvent: '2026-09-02 14:02 点击链接' },
    { id: 'r-5', name: '周婷', email: 'zhouting@edu-star.edu', company: '星辰教育', status: 'opened', openCount: 1, lastEvent: '2026-09-02 11:48 打开邮件' },
    { id: 'r-6', name: '刘洋', email: 'liuyang@cloudwave.com', company: '云浪科技', status: 'delivered', openCount: 0, lastEvent: '2026-09-02 10:05 送达' },
    { id: 'r-7', name: '郑爽', email: 'zhengshuang@auto-group.cn', company: '中汽集团', status: 'delivered', openCount: 0, lastEvent: '2026-09-02 10:04 送达' },
    { id: 'r-8', name: '冯磊', email: 'fenglei@medcare.cn', company: '康护医疗', status: 'opened', openCount: 2, lastEvent: '2026-09-02 09:58 打开邮件' },
    { id: 'r-9', name: '何静', email: 'hejing@logistics8.com', company: '八方物流', status: 'bounced', openCount: 0, lastEvent: '2026-09-02 09:40 退信：地址不存在' },
    { id: 'r-10', name: '林峰', email: 'linfeng@smartcity.gov', company: '智慧城市研究院', status: 'clicked', openCount: 3, lastEvent: '2026-09-02 09:36 点击报名链接' },
    { id: 'r-11', name: '徐丽', email: 'xuli@fashion-now.com', company: '时尚前线', status: 'replied', openCount: 2, lastEvent: '2026-09-02 09:20 回复邮件' },
    { id: 'r-12', name: '马涛', email: 'matao@buildhome.cn', company: '筑家地产', status: 'pending', openCount: 0, lastEvent: '等待发送' }
  ],

  /* ---------- 意向客户（评分模型输出） ---------- */
  leads: [
    { id: 'c-1', name: '李娜', email: 'lina@brightfuture.com', company: '光明未来科技', avatar: 'indigo',
      score: 92, level: '高意向', replySpeed: '2 小时内回复', keywords: ['试用', '报价', '折扣'], interactions: '近 7 天往来 6 封 · 打开 4 次', source: 'Q3 新产品推广', lastActive: '2026-09-03' },
    { id: 'c-3', name: '陈静', email: 'chenjing@lenovo-mall.cn', company: '联想商城', avatar: 'green',
      score: 95, level: '高意向', replySpeed: '3 小时内回复', keywords: ['合同', '盖章', '开通'], interactions: '近 7 天往来 9 封 · 打开 6 次', source: '一对一跟进', lastActive: '2026-09-02' },
    { id: 'c-2', name: '王强', email: 'wangqiang@techstar.io', company: 'TechStar', avatar: 'sky',
      score: 88, level: '高意向', replySpeed: '当天下班前回复', keywords: ['报名', 'CRM', '演示'], interactions: '近 7 天往来 5 封 · 打开 3 次', source: '秋季发布会邀请', lastActive: '2026-09-03' },
    { id: 'c-6', name: '孙浩', email: 'sunhao@finance360.cn', company: '金融360', avatar: 'violet',
      score: 80, level: '高意向', replySpeed: '当天回复', keywords: ['评审', '采购', '纪要'], interactions: '近 14 天往来 9 封 · 打开 5 次', source: '一对一跟进', lastActive: '2026-09-01' },
    { id: 'c-8', name: '吴刚', email: 'wugang@manufacture-pro.com', company: '精工制造', avatar: 'indigo',
      score: 78, level: '中意向', replySpeed: '1 天内回复', keywords: ['扩容', '二期'], interactions: '近 30 天往来 4 封 · 打开 8 次', source: '中秋问候', lastActive: '2026-08-31' },
    { id: 'c-7', name: '周婷', email: 'zhouting@edu-star.edu', company: '星辰教育', avatar: 'teal',
      score: 62, level: '中意向', replySpeed: '首次咨询', keywords: ['分班通知', '家校沟通', '5万学员'], interactions: '近 7 天往来 1 封', source: '官网线索', lastActive: '2026-09-01' },
    { id: 'c-4', name: '刘洋', email: 'liuyang@cloudwave.com', company: '云浪科技', avatar: 'amber',
      score: 45, level: '低意向', replySpeed: '2 天回复', keywords: ['Q4', '预算', '资料'], interactions: '近 14 天往来 2 封 · 打开 1 次', source: 'Q3 新产品推广', lastActive: '2026-09-02' },
    { id: 'r-8', name: '冯磊', email: 'fenglei@medcare.cn', company: '康护医疗', avatar: 'rose',
      score: 58, level: '中意向', replySpeed: '未回复', keywords: ['打开 2 次'], interactions: '近 7 天打开 2 次 · 未回复', source: '秋季发布会邀请', lastActive: '2026-09-02' },
    { id: 'r-10', name: '林峰', email: 'linfeng@smartcity.gov', company: '智慧城市研究院', avatar: 'teal',
      score: 71, level: '中意向', replySpeed: '未回复', keywords: ['点击报名', '打开 3 次'], interactions: '近 7 天打开 3 次 · 点击链接 2 次', source: '秋季发布会邀请', lastActive: '2026-09-02' },
    { id: 'c-5', name: '赵敏', email: 'zhaomin@retailking.com', company: '零售王', avatar: 'rose',
      score: 8, level: '无效', replySpeed: '退信', keywords: ['地址不存在'], interactions: '退信 1 次', source: 'Q3 新产品推广', lastActive: '2026-09-02' }
  ],

  /* ---------- 近 14 天趋势（看板/分析页） ---------- */
  trend: (() => {
    const days = [];
    const today = new Date('2026-09-03');
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const seed = (d.getDate() * 7 + d.getDay() * 13) % 10;
      days.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        sent: 120 + seed * 22 + (i < 4 ? 90 : 0),
        opened: 52 + seed * 11 + (i < 4 ? 40 : 0),
        replied: 8 + seed * 3 + (i < 4 ? 10 : 0)
      });
    }
    return days;
  })(),

  /* ---------- 通知 ---------- */
  notifications: [
    { icon: 'reply', color: 'ic-green', text: '<b>李娜</b> 回复了邮件《智能客服方案报价》，并提出试用需求', time: '10 分钟前' },
    { icon: 'send', color: 'ic-indigo', text: '任务《秋季发布会邀请函》已发送 <b>512/860</b>，进度 60%', time: '1 小时前' },
    { icon: 'star', color: 'ic-amber', text: '系统检测到 <b>2 位新高意向客户</b>：王强、林峰', time: '3 小时前' },
    { icon: 'bounce', color: 'ic-red', text: '任务《Q3 新产品推广》产生 <b>38 封退信</b>，已自动标记', time: '昨天 18:20' },
    { icon: 'warn', color: 'ic-amber', text: '邮箱 <b>sales01@acme-corp.com</b> 连接异常，请检查授权', time: '昨天 09:02' }
  ],

  /* ---------- 动态活动流 ---------- */
  activities: [
    { icon: 'reply', color: 'ic-green', text: '<b>李娜</b> 回复邮件并希望安排试用，意向分升至 <b>92</b>', time: '2026-09-03 09:42' },
    { icon: 'send', color: 'ic-indigo', text: '任务《秋季发布会邀请函》持续发送中，已发 <b>512</b> 封', time: '2026-09-03 09:30' },
    { icon: 'file', color: 'ic-sky', text: '<b>陈静</b> 回传盖章合同，成交金额 ¥186,000', time: '2026-09-02 17:58' },
    { icon: 'bounce', color: 'ic-red', text: '<b>zhaomin@retailking.com</b> 退信，地址已标记为无效', time: '2026-09-02 11:05' },
    { icon: 'click', color: 'ic-amber', text: '<b>林峰</b> 点击了发布会报名链接，打开 3 次', time: '2026-09-02 09:36' }
  ],

  /* 邮件服务商预设 */
  providerPresets: [
    { type: '企业邮箱（腾讯企业邮）', smtp: 'smtp.exmail.qq.com', imap: 'imap.exmail.qq.com', port: 465 },
    { type: 'Gmail', smtp: 'smtp.gmail.com', imap: 'imap.gmail.com', port: 465 },
    { type: 'Outlook / Office365', smtp: 'smtp.office365.com', imap: 'outlook.office365.com', port: 587 },
    { type: '网易 163 企业邮', smtp: 'smtp.163.com', imap: 'imap.163.com', port: 465 },
    { type: '阿里企业邮箱', smtp: 'smtp.qiye.aliyun.com', imap: 'imap.qiye.aliyun.com', port: 465 },
    { type: '自定义（手动填写）', smtp: '', imap: '', port: 465 }
  ]
};
