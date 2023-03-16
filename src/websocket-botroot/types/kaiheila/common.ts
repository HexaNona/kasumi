/* eslint-disable camelcase */
export interface KHRole {
  /**
   * 角色的id
   */
  role_id: number
  /**
   * 角色的名称
   */
  name: string
  /**
   * 角色的色值0x000000 - 0xFFFFFF
   */
  color: number
  /**
   * 顺序，值越小载靠前
   */
  position: number
  /**
   * 只能为0或者1，是否把该角色的用户在用户列表排到前面
   */
  hoist: number
  /**
   * 只能为0或者1，该角色是否可以被提及
   */
  mentionable: number
  /**
   * 权限,参见[权限说明](#权限说明)
   */
  permissions: number
}

export interface KHUser {
  id: string
  username: string
  avatar: string
  online: boolean
  identify_num: string
  bot?: boolean
}

export interface KHUserInGuild extends KHUser {
  nickname: string
  roles?: number[]
  joined_at?: number
  active_time?: number
  is_master?: boolean
  mobile_verified?: boolean
  color?: number
  os?: string
}

export interface KHGuild {
  /**
   * 默认频道
   */
  default_channel_id: string
  /**
   * 是否为公开服务器
   */
  enable_open: number
  /**
   * 服务器icon的地址
   */
  icon: string
  /**
   * 服务器id
   */
  id: string
  /**
   * 是否开启邀请
   */
  invite_enabled: number
  /**
   * 当前用户是否为服务器主人
   */
  is_master: boolean
  /**
   * 服务器名称
   */
  name: string
  /**
   * 通知类型, `0`代表默认使用服务器通知设置，`1`代表接收所有通知, `2`代表仅@被提及，`3`代表不接收通知
   */
  notify_type: number
  /**
   * 公开服务器id
   * 文档写string，实际为number
   */
  open_id: string
  /**
   * 服务器主题
   */
  topic: string
  /**
   * 欢迎频道
   */
  welcome_channel_id: string
  /**
   * 服务器主的id
   */
  master_id: string
  /**
   * 服务器默认使用语音区域
   */
  region: string
}

export interface KHAuthor {
  identify_num: string
  avatar: string
  bot?: boolean
  username: string
  id: string
  nickname: string
  roles: number[]
  online: boolean
  tag_info?: {
    color: string
    text: string
  }
}

export interface KHemoji {}

export interface KHChannel {
  guild_id: string
  id: string
  is_category: boolean
  level: number
  limit_amount: number
  master_id: string
  name: string
  parent_id: string
  permission_overwrites: { role_id: number; allow: number; deny: number }[]
  permission_sync: number
  permission_users: { user: KHUserInGuild; allow: number; deny: number }[]
  slow_mode: number
  topic: string
  type: number
  user_id: string
  server_url: string
}
