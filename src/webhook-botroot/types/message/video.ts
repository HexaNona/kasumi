import { VideoAttachment } from '../attachment/video'
import { UserInGuildNonStandard } from '../common'
import { MessageType } from '../MessageType'
import { MessageBase } from './base'

export interface VideoMessage extends MessageBase {
  type: MessageType.video
  attachment: VideoAttachment
  author: UserInGuildNonStandard
}
