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

