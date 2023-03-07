import { AttachmentBase } from './base'

export interface VideoAttachment extends AttachmentBase {
  type: 'video'
  size: number
  fileType: string
  height: number
  width: number
  duration: number
  url: string
}
