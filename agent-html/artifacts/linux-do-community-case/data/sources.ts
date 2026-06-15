import type { SourceLinkItem } from "../../../components/source-links"

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

