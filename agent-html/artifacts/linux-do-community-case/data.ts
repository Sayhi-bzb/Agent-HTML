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

export const firstDaySteps = [
  {
    step: "01",
    title: "先浏览，不急着发帖",
    value: "看几个热门主题、公告和 Wiki 入口，先感受社区讨论方式。",
  },
  {
    step: "02",
    title: "读社区文化和守则",
    value: "理解真诚、友善、团结、专业，以及哪些行为会破坏公共空间。",
  },
  {
    step: "03",
    title: "了解信任等级",
    value: "知道权限不是一次性给满，而是随着阅读、访问和参与逐步开放。",
  },
  {
    step: "04",
    title: "收藏常用入口",
    value: "把 Wiki、百宝箱、Connect 和邮箱入口放在手边，少走弯路。",
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
] as const

export const trustLevels = [
  {
    level: "TL0",
    title: "新用户",
    role: "先熟悉环境",
    value: "从阅读开始，理解社区节奏和基本规则。",
  },
  {
    level: "TL1",
    title: "基础用户",
    role: "开始参与",
    value: "持续浏览和阅读后，逐步获得更多基础能力。",
  },
  {
    level: "TL2",
    title: "成员",
    role: "形成连续参与",
    value: "访问、回复和互动开始体现账号的稳定性。",
  },
  {
    level: "TL3",
    title: "常规用户",
    role: "成为可靠成员",
    value: "长期保持高质量参与，获得更高社区信任。",
  },
  {
    level: "TL4",
    title: "领导者",
    role: "承担维护责任",
    value: "更接近社区维护者身份，不是普通打卡升级。",
  },
] as const

export const postingChecklist = [
  {
    label: "标题能说明问题",
    value: "让别人不用点进去也能判断主题范围。",
  },
  {
    label: "上下文足够",
    value: "说明环境、目标、尝试过什么、卡在哪里。",
  },
  {
    label: "分类和标签合适",
    value: "把内容放到正确位置，方便后来者搜索和阅读。",
  },
  {
    label: "语气尊重",
    value: "可以直接，但不要把求助、争论或吐槽变成攻击。",
  },
  {
    label: "先查已有资料",
    value: "发帖前看 Wiki、搜索旧帖或百宝箱，避免重复低质量问题。",
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
