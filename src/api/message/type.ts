import { MessageType, RawAttachment, RawEmbedding, RawMention, RawReaction } from "type"

export interface RawListResponse {
    items: Array<RawMessageItem>
}

export interface RawMessageItem {
    id: string,
    type: MessageType,
    content: string,
    mention: string[],
    mention_all: boolean,
    mention_roles: any[],
    mention_here: boolean,
    embeds: Array<RawEmbedding.BilibiliVideo>,
    attachments: null | RawAttachment.File | RawAttachment.Video,
    create_at: number,
    update_at: number,
    reactions: Array<RawReaction>,
    author: {
        id: string,
        username: string,
        online: boolean,
        avatar: string
    },
    image_name: string,
    read_status: boolean,
    quote: null,
    mention_info: {
        mention_part: Array<RawMention.User>,
        mention_role_part: Array<RawMention.Role>
    }
}