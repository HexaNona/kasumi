import { UserInGuildNonStandard } from '../common'
import { MessageType } from '../MessageType'
import { MessageBase } from './base'

export interface TextMessage extends MessageBase {
  type: MessageType.text
  author: UserInGuildNonStandard
  quote?: TextMessage
  channelName?: string
  code: string
  content: string
  mention: {
    user: string[]
    roles: string[]
    all: boolean
    here: boolean
  }
}
