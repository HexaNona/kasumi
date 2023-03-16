import { KHUser, KHUserInGuild } from './common'

export interface KHEvent {
  type: string
  body: any
}

export interface KHButtonClickEvent extends KHEvent {
  type: 'message_btn_click'
  body: {
    channel_type: string | 'GROUP'
    msg_id: string
    guild_id: string
    user_id: string
    value: string
    target_id: string
    user_info: KHUser & Partial<KHUserInGuild>
  }
}
