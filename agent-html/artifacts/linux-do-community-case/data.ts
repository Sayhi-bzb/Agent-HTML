import type { SourceLinkItem } from "../../components/source-links"

export const linuxDoSources = {
  core: [
    {
      label: "LINUX DO",
      note: "社区主站，日常讨论和发帖入口。",
      url: "https://linux.do/",
    },
    {
      label: "LINUX DO Wiki",
      note: "新人说明、社区规则、服务入口和工具指南。",
      url: "https://wiki.linux.do/",
    },
  ],
  handbook: [
    {
      label: "社区文化",
      note: "先了解这里鼓励什么样的相处方式。",
      url: "https://wiki.linux.do/LinuxDo/culture",
    },
    {
      label: "社区守则",
      note: "发言、互动和使用社区前应知道的边界。",
      url: "https://wiki.linux.do/LinuxDo/rules",
    },
    {
      label: "信任等级",
      note: "新人到高信任成员的成长路线。",
      url: "https://wiki.linux.do/LinuxDo/trustlevel",
    },
    {
      label: "管理人员",
      note: "了解社区维护角色，以及遇到管理问题时的官方说明。",
      url: "https://wiki.linux.do/LinuxDo/administrator",
    },
  ],
  services: [
    {
      label: "百宝箱",
      note: "常用资源、工具和社区服务索引。",
      url: "https://wiki.linux.do/LinuxDo/toolbox",
    },
    {
      label: "Connect",
      note: "LINUX DO 身份和授权服务入口。",
      url: "https://connect.linux.do/",
    },
    {
      label: "社区邮箱",
      note: "社区邮箱服务入口。",
      url: "https://webmail.linux.do/",
    },
  ],
} satisfies Record<string, SourceLinkItem[]>

export const entryCards = [
  {
    label: "论坛",
    note: "看帖、回复、发起讨论",
    value: "适合日常交流、技术问题、资源分享和社区互动。",
  },
  {
    label: "Wiki",
    note: "查规则、找入口、读说明",
    value: "适合新人先读，也适合老成员引用稳定说明。",
  },
  {
    label: "服务",
    note: "Connect、邮箱、百宝箱",
    value: "把社区账号和常用工具连接到论坛之外。",
  },
] as const

export const entryUseChartData = [
  {
    entry: "论坛",
    score: 92,
    job: "讨论、回复、发帖",
  },
  {
    entry: "Wiki",
    score: 86,
    job: "规则、入口、说明",
  },
  {
    entry: "百宝箱",
    score: 72,
    job: "工具、资源、服务",
  },
  {
    entry: "Connect / 邮箱",
    score: 58,
    job: "身份、授权、联系",
  },
] as const

export const firstDaySteps = [
  {
    step: "01",
    title: "先浏览，不急着发帖",
    action: "打开论坛首页",
    value: "看几个热门主题、公告和 Wiki 入口，先感受社区讨论方式。",
  },
  {
    step: "02",
    title: "读社区文化和守则",
    action: "看文化与守则",
    value: "理解真诚、友善、团结、专业，以及哪些行为会破坏公共空间。",
  },
  {
    step: "03",
    title: "了解信任等级",
    action: "确认成长路径",
    value: "知道权限不是一次性给满，而是随着阅读、访问和参与逐步开放。",
  },
  {
    step: "04",
    title: "收藏常用入口",
    action: "收藏百宝箱",
    value: "把 Wiki、百宝箱、Connect 和邮箱入口放在手边，少走弯路。",
  },
] as const

export const firstDayAllocation = [
  {
    label: "浏览论坛",
    share: 35,
  },
  {
    label: "读规则",
    share: 25,
  },
  {
    label: "理解等级",
    share: 20,
  },
  {
    label: "收藏入口",
    share: 20,
  },
] as const

export const hotTopicSamples = [
  {
    rank: "01",
    title: "应该是目前最强的PPT Agent，附上完整思路分享",
    author: "Sandun",
    publishedAt: "3月 19 日",
    category: "工具实践",
    kind: "工具",
    signal: "Agent 工作流",
    readWeight: 96,
    newcomerFocus: "先看作者如何拆解需求、提示词、工具链和失败点。",
    participationTip: "收藏思路即可，不要只回复“求链接”；先说明你想复现哪一步。",
    url: "https://linux.do/top",
  },
  {
    rank: "02",
    title: "[超详细教学] 教你从零开始，入坑域名、云服务器并部署 New API + Open WebUI！",
    author: "Cook_Sleep",
    publishedAt: "2025 年 7月 9日",
    category: "教程",
    kind: "教程",
    signal: "从零部署",
    readWeight: 92,
    newcomerFocus: "适合学习长教程的结构：前置条件、步骤、排错和验收。",
    participationTip: "遇到问题时带上系统、服务商、错误日志和卡住的具体步骤。",
    url: "https://linux.do/top",
  },
  {
    rank: "03",
    title: "《 Claude Code 终极版 FAQ 指南 》",
    author: "哈雷彗星",
    publishedAt: "5月 23 日",
    category: "教程",
    kind: "教程",
    signal: "FAQ 整理",
    readWeight: 88,
    newcomerFocus: "观察高质量 FAQ 如何把分散问题整理成可搜索的答案。",
    participationTip: "补充经验时给出版本、场景和限制，不要把个例写成绝对结论。",
    url: "https://linux.do/top",
  },
  {
    rank: "04",
    title: "Cursor++ | 极为顺滑的 BYOK Server 集成",
    author: "哈雷彗星",
    publishedAt: "4月 9 日",
    category: "工具实践",
    kind: "工具",
    signal: "编辑器增强",
    readWeight: 82,
    newcomerFocus: "看清楚工具帖通常同时包含体验、配置、成本和风险提示。",
    participationTip: "提问前先确认自己使用的是哪种 key、哪种代理和哪版客户端。",
    url: "https://linux.do/top",
  },
  {
    rank: "05",
    title: "〖教程〗2026版 小白也能看懂的自建Cloudflare临时邮箱教程（域名邮箱）",
    author: "小黄",
    publishedAt: "6月 12 日",
    category: "教程",
    kind: "教程",
    signal: "基础设施",
    readWeight: 78,
    newcomerFocus: "适合新人练习按步骤搭服务，并理解域名、DNS、邮件路由这些概念。",
    participationTip: "反馈时说明域名状态、DNS 记录和验证结果，别只说“不能用”。",
    url: "https://linux.do/top",
  },
  {
    rank: "06",
    title: "【又520专场】你如何理解我们的社区文化",
    author: "Neo",
    publishedAt: "5月 20 日",
    category: "社区文化",
    kind: "文化",
    signal: "相处方式",
    readWeight: 74,
    newcomerFocus: "用它理解社区里的玩笑、边界、共识和长期成员的表达方式。",
    participationTip: "文化帖适合真诚表达，不适合借题攻击别人或制造阵营对立。",
    url: "https://linux.do/top",
  },
] as const

export const hotTopicGroups = [
  {
    id: "tutorial",
    label: "教程",
    summary: "长教程通常最适合新人收藏：它会暴露前置条件、步骤和排错路径。",
    topicTitles: [
      "[超详细教学] 教你从零开始，入坑域名、云服务器并部署 New API + Open WebUI！",
      "《 Claude Code 终极版 FAQ 指南 》",
      "〖教程〗2026版 小白也能看懂的自建Cloudflare临时邮箱教程（域名邮箱）",
    ],
  },
  {
    id: "tool",
    label: "工具",
    summary: "工具帖适合看作者如何说明适用场景、配置成本和失败边界。",
    topicTitles: [
      "应该是目前最强的PPT Agent，附上完整思路分享",
      "Cursor++ | 极为顺滑的 BYOK Server 集成",
    ],
  },
  {
    id: "culture",
    label: "文化",
    summary: "文化帖帮助新人理解社区语气和边界，比单看规则更容易进入语境。",
    topicTitles: ["【又520专场】你如何理解我们的社区文化"],
  },
] as const

export const culturePrinciples = [
  {
    label: "真诚",
    role: "真实说明问题",
    interpretation:
      "提问时给出背景、尝试过的方法和真实需求；分享时避免标题党和误导。",
  },
  {
    label: "友善",
    role: "让新人敢参与",
    interpretation:
      "不同经验水平的人都会出现。表达不同意见时，也尽量让对方能继续对话。",
  },
  {
    label: "团结",
    role: "共同维护空间",
    interpretation:
      "不要把社区当成一次性资源池。好的讨论、反馈和整理都会让后来者受益。",
  },
  {
    label: "专业",
    role: "提高信息质量",
    interpretation:
      "尽量提供可复现的信息、清楚的判断和有用的链接，而不是只留下情绪。",
  },
] as const

export const entryRows = [
  {
    need: "想知道 LINUX DO 是什么",
    go: "Wiki 首页 / 论坛首页",
    reason: "先建立整体地图，再进入具体主题。",
  },
  {
    need: "想确认能不能发某类内容",
    go: "社区守则",
    reason: "先看边界，减少发帖后被提醒或移动分类。",
  },
  {
    need: "想找工具、资源或服务",
    go: "百宝箱",
    reason: "集中查看社区维护的工具和入口。",
  },
  {
    need: "想理解权限为什么受限",
    go: "信任等级",
    reason: "新人权限和成长路径通常与信任等级相关。",
  },
  {
    need: "遇到账号、帖子、秩序或反馈问题",
    go: "管理人员 / 社区守则",
    reason: "先确认角色和边界，再用合适方式反馈。",
  },
] as const

export const navigationGroups = [
  {
    id: "learn",
    label: "了解社区",
    rows: [
      {
        target: "知道这里是什么",
        entry: "Wiki 首页",
        detail: "先读稳定说明，再进入论坛信息流。",
      },
      {
        target: "了解相处方式",
        entry: "社区文化",
        detail: "把真诚、友善、团结、专业当作发言基线。",
      },
    ],
  },
  {
    id: "join",
    label: "参与讨论",
    rows: [
      {
        target: "准备发帖",
        entry: "社区守则",
        detail: "先确认内容边界、语气和分类是否合适。",
      },
      {
        target: "理解权限",
        entry: "信任等级",
        detail: "新账号限制通常来自默认保护，不是单独针对你。",
      },
    ],
  },
  {
    id: "tools",
    label: "找工具服务",
    rows: [
      {
        target: "找资源",
        entry: "百宝箱",
        detail: "集中查看社区工具、资源和服务入口。",
      },
      {
        target: "管理身份",
        entry: "Connect / 邮箱",
        detail: "把社区账号连接到授权、邮箱等服务。",
      },
    ],
  },
  {
    id: "support",
    label: "反馈与维护",
    rows: [
      {
        target: "找管理说明",
        entry: "管理人员",
        detail: "了解管理员、版主等社区维护角色，避免把普通讨论升级成无效求助。",
      },
      {
        target: "确认行为边界",
        entry: "社区守则",
        detail: "先判断问题是否涉及规则，再决定是回复、举报还是整理反馈。",
      },
      {
        target: "准备反馈材料",
        entry: "相关主题链接",
        detail: "保留链接、说明背景和期望处理结果，避免只留下情绪化指控。",
      },
    ],
  },
] as const

export const trustLevels = [
  {
    level: "TL0",
    title: "新用户",
    role: "先熟悉环境",
    value: "从阅读开始，理解社区节奏和基本规则。",
    progress: 12,
  },
  {
    level: "TL1",
    title: "基础用户",
    role: "开始参与",
    value: "持续浏览和阅读后，逐步获得更多基础能力。",
    progress: 32,
  },
  {
    level: "TL2",
    title: "成员",
    role: "形成连续参与",
    value: "访问、回复和互动开始体现账号的稳定性。",
    progress: 55,
  },
  {
    level: "TL3",
    title: "常规用户",
    role: "成为可靠成员",
    value: "长期保持高质量参与，获得更高社区信任。",
    progress: 78,
  },
  {
    level: "TL4",
    title: "领导者",
    role: "承担维护责任",
    value: "更接近社区维护者身份，不是普通打卡升级。",
    progress: 100,
  },
] as const

export const postingChecklist = [
  {
    label: "标题能说明问题",
    hint: "别人能在列表页判断要不要点开。",
    value: "让别人不用点进去也能判断主题范围。",
  },
  {
    label: "上下文足够",
    hint: "环境、目标、尝试、卡点都要交代。",
    value: "说明环境、目标、尝试过什么、卡在哪里。",
  },
  {
    label: "分类和标签合适",
    hint: "正确位置会让后来者也能找到。",
    value: "把内容放到正确位置，方便后来者搜索和阅读。",
  },
  {
    label: "语气尊重",
    hint: "直接表达，不做人身攻击。",
    value: "可以直接，但不要把求助、争论或吐槽变成攻击。",
  },
  {
    label: "先查已有资料",
    hint: "先搜索旧帖、Wiki 和百宝箱。",
    value: "发帖前看 Wiki、搜索旧帖或百宝箱，避免重复低质量问题。",
  },
] as const

export const postingChecklistChartData = [
  {
    dimension: "标题",
    score: 90,
  },
  {
    dimension: "上下文",
    score: 86,
  },
  {
    dimension: "分类",
    score: 72,
  },
  {
    dimension: "语气",
    score: 80,
  },
  {
    dimension: "预检",
    score: 76,
  },
] as const

export const newcomerTips = [
  {
    label: "先读再发",
    value: "新人最稳的进入方式是先读 Wiki、守则和几个已有讨论。",
  },
  {
    label: "把账号当身份",
    value: "信任等级会随着长期行为积累，短期冲动会影响别人对你的判断。",
  },
  {
    label: "提问要可回答",
    value: "清楚的问题比宽泛求助更容易得到有效回复。",
  },
  {
    label: "善用 Wiki 和百宝箱",
    value: "稳定入口通常比临时帖子更适合找规则、服务和工具。",
  },
] as const
