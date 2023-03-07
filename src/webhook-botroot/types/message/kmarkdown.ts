import { UserInGuildNonStandard } from '../common'
import { MessageType } from '../MessageType'
import { MessageBase } from './base'

export interface KMarkdownMessage extends MessageBase {
  type: MessageType.kMarkdown
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
