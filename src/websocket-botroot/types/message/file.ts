import { FileAttachment } from '@ksm/websocket-botroot/types/attachment/file'
import { UserInGuildNonStandard } from '@ksm/websocket-botroot/types/common'
import { MessageType } from '@ksm/websocket-botroot/types/MessageType'
import { MessageBase } from './base'

export interface FileMessage extends MessageBase {
  type: MessageType.file
  attachment: FileAttachment
  author: UserInGuildNonStandard
}
