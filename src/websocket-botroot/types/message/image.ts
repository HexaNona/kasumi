import { ImageAttachment } from '../attachment/image'
import { UserInGuildNonStandard } from '../common'
import { MessageType } from '../MessageType'
import { MessageBase } from './base'

export interface ImageMessage extends MessageBase {
  type: MessageType.image
  code: string
  content: string
  author: UserInGuildNonStandard
  attachment: ImageAttachment
}
