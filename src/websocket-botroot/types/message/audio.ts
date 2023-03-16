import { AudioAttachment } from '../attachment/audio'
import { UserInGuildNonStandard } from '../common'
import { MessageType } from '../MessageType'
import { MessageBase } from './base'

export interface AudioMessage extends MessageBase {
  type: MessageType.voice
  attachment: AudioAttachment
  author: UserInGuildNonStandard
}
