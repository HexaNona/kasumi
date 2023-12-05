import { UserInGuildNonStandard } from '@ksm/websocket-botroot/types/common'
import { MessageType } from '@ksm/websocket-botroot/types/MessageType'
import { MessageBase } from './base'

export interface CardMessage extends MessageBase {
  type: MessageType.card
  author: UserInGuildNonStandard
  mention: {
    user: string[]
    roles: string[]
    all: boolean
    here: boolean
    channels: string[]
  }
  channelName: string
  content: string
  code: string
}
