import { AttachmentBase } from './base'

export interface ImageAttachment extends AttachmentBase {
  url: string
  type: 'image'
}
