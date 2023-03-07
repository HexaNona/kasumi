import { User } from '../common'

export interface ButtonClickEvent {
  msgId: string
  msgTimestamp: number
  type: string
  channelType: string
  guildId: string
  channelId: string
  targetMsgId: string
  value: string
  userId: string
  user: User
}
