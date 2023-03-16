import { FileAttachment } from '../attachment/file'
import { UserInGuildNonStandard } from '../common'
import { MessageType } from '../MessageType'
import { MessageBase } from './base'

export interface FileMessage extends MessageBase {
  type: MessageType.file
  attachment: FileAttachment
  author: UserInGuildNonStandard
}
