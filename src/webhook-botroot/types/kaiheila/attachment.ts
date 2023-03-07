export interface KHAttachment {
  type: string
  name: string
  url: string
}

export interface KHImageAttachment extends KHAttachment {
  type: 'image'
}

export interface KHVideoAttachment extends KHAttachment {
  type: 'video'
  url: string
  file_type: string
  name: string
  size: number
  height: number
  width: number
  duration: number
}

export interface KHFileAttachment extends KHAttachment {
  type: 'file'
  file_type: string
  size: number
}

export interface KHAudioAttachment {
  type: 'audio'
  voice: string
  mime_type: string
  duration: number
}
