

export enum MessageType {
    TextMessage = 1,
    ImageMessage = 2,
    VideoMessage = 3,
    FileMessage = 4,
    AudioMessage = 8,
    MarkdownMessage = 9,
    CardMessage = 10,
    ActionMessage = 12,
    SystemMessage = 255
}

export type GuildType = 'GROUP' | 'PERSON' | 'BROADCAST';

export enum ChannelType {
    TextChannel = 1,
    VoiceChannel = 2
}

export enum UserStatus {
    Normal_0 = 0,
    Normal_1 = 1,
    Banned = 10
}

export enum NotificationSetting {
    Default = 0,
    All = 1,
    MentionOnly = 2,
    Block = 3
}

export interface User {
    id: string,
    username: string,
    nickname: string,
    identify_num: string,
    online: boolean,
    bot: boolean,
    status: UserStatus,
    avatar: string,
    vip_avatar: string,
    mobile_verified: boolean,
    roles: number[]
}

export interface Message {
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

export interface Game {
    id: number,
    name: string,
    type: number,
    options: string,
    kmhook_admin: boolean,
    process_name: string[],
    product_name: string[],
    icon: string
}

export interface Emoji {
    name: string,
    id: string,
    user_info: {
        id: string,
        username: string,
        identify_num: string,
        online: boolean,
        os: string,
        status: number,
        avatar: string
    }
}

export interface Guild {
    id: string,
    name: string,
    topic: string,
    user_id: string,
    icon: string,
    notify_type: NotificationSetting,
    region: string,
    enable_open: string,
    open_id: string,
    default_channel_id: string,
    welcome_channel_id: string,
    roles: Role[],
    channels: Channel[]
}

export interface Channel extends Omit<BriefChannel, 'limit_amount'> {
    guild_id: string,
    topic: string,
    slow_mode: number
}

export interface MultiPageResponse<T> {
    meta: {
        page: number,
        page_total: number,
        page_size: number,
        total: number
    },
    items: T[],
    sort: any
}

export interface Role {
    role_id: number,
    name: string,
    color: number,
    position: number,
    hoist: 0 | 1,
    mentionable: 0 | 1,
    permissions: number
}

export interface BriefChannel {
    id: string,
    name: string,
    user_id: string,
    parent_id: string,
    type: ChannelType,
    level: number,
    limit_amount: number,
    is_category: boolean
}

export interface FullChannel extends BriefChannel {
    guild_id: string,
    topic: string,
    slow_mode: number,
    permission_overwrites: {
        role_id: number,
        allow: number,
        deny: number
    }[],
    permission_users: {
        user: User,
        allow: number,
        deny: number
    }[],
    permission_sync: 0 | 1
}

export interface Quote {
    id: string,
    type: MessageType,
    content: string,
    create_at: number,
    author: User
}

export namespace WebSocket {
    export type Signals = Signal.Hello | Signal.Event | Signal.Ping | Signal.Pong | Signal.Resume | Signal.Reconnect | Signal.ResumeACK;
    export interface MessageQueue {
        0: Signal.Event[],
        1: Signal.Hello[],
        2: Signal.Ping[],
        3: Signal.Pong[],
        4: Signal.Resume[],
        5: Signal.Reconnect[],
        6: Signal.ResumeACK[],
    }
    export interface MessageTypes {
        0: Signal.Event,
        1: Signal.Hello,
        2: Signal.Ping,
        3: Signal.Pong,
        4: Signal.Resume,
        5: Signal.Reconnect,
        6: Signal.ResumeACK,
    }
    export enum SignalType {
        Event = 0,
        Hello = 1,
        Ping = 2,
        Pong = 3,
        Resume = 4,
        Reconnect = 5,
        ResumeACK = 6
    }
    export enum State {
        Initialization = 0,
        ConnectGateway = 1,
        ConnectionOpen = 2,
        RecievingMessage = 3,
        NeedsRestart = 255
    }
    export namespace Signal {
        export interface Hello {
            s: 1,
            d: {
                code: 0,
                session_id: string
            }
        }
        export interface Event {
            s: 0,
            d: NormalMessageEvent<NormalMessageType, GuildType> | SystemMessageEvent,
            sn: number
        }
        export interface Ping {
            s: 2,
            sn: number,
        }
        export interface Pong {
            s: 3
        }
        export interface Resume {
            s: 4,
            sn: number
        }
        export interface Reconnect {
            s: 5,
            d: {
                code: ReconnectReason,
                err: string
            }
        }
        export interface ResumeACK {
            s: 6,
            d: {
                session_id: string
            }
        }
    }

    export enum ReconnectReason {
        MissingParams = 40106,
        SessionExpired = 40107,
        SNInvalid = 40108
    }

    export interface MessageEvent {
        channel_type: GuildType,
        type: MessageType,
        target_id: string,
        author_id: string,
        content: any,
        msg_id: string,
        msg_timestamp: string,
        nonce: string,
        extra: any
    }

    interface MessageEventExtra {
        1: {
            type: MessageType.TextMessage,
            author: User
        }
        2: {
            type: MessageType.ImageMessage,
            author: User,
            attachments: {
                type: 'image',
                name: string,
                url: string
            }
        },
        3: {
            type: MessageType.VideoMessage,
            author: User,
            attachments: {
                type: "video",
                name: string,
                url: string,
                file_type: string,
                size: number,
                duration: number,
                width: number,
                height: number
            }
        },
        4: {
            type: MessageType.FileMessage,
            author: User,
            attachments: any
        },
        8: {
            type: MessageType.AudioMessage,
            author: User,
            attachments: any
        },
        9: {
            type: MessageType.MarkdownMessage,
            author: User
        },
        10: {
            type: MessageType.CardMessage,
            author: User
        }
        12: {
            type: MessageType.ActionMessage,
            author: User,
            kmakrdown: {
                mention: string[],
                mention_part: Array<RawMention.User>,
                item_part: Items[]
            }
        }
    }
    export type NormalMessageType = Exclude<MessageType, MessageType.SystemMessage>;
    interface MessageEventChannelTypeExtra<T extends NormalMessageType> {
        'GROUP': MessageEventExtra[T] & {
            guild_id: string,
            mention: any[],
            mention_all: boolean,
            mention_roles: any[],
            mention_here: boolean
        },
        'PERSON': MessageEventExtra[T],
        'BROADCAST': MessageEventExtra[T]
    }
    export interface NormalMessageEvent<T extends NormalMessageType, K extends GuildType> extends MessageEvent {
        channel_type: K,
        content: T extends MessageType.ActionMessage ? {
            type: 'item',
            data: {
                user_id: string,
                target_id: string,
                item_id: string
            }
        } : string,
        type: T,
        extra: MessageEventChannelTypeExtra<T>[K]
    }
    export type Items = PokeItem;
    export interface PokeItem {
        id: number,
        name: string,
        desc: string,
        cd: number,
        categories: string[],
        label: number,
        label_name: string,
        quality: number,
        icon: string,
        icon_thumb: string,
        icon_expired: string,
        quality_resouce: {
            color: string,
            small: string,
            big: string
        },
        resources: {
            type: 'ImageAnimation',
            preview_expired: string,
            webp: string,
            pag: string,
            gif: string,
            time: number,
            width: number,
            height: number,
            percent: number
        },
        msg_scenarios: {
            ABA: string,
            ABB: string,
            ABC: string,
            AAA: string,
            AAB: string
        }
    }
    export interface SystemMessageEvent extends MessageEvent {
        type: MessageType.SystemMessage,
        content: string,
        extra: {
            type: string,
            body: any
        }
    }

    export interface UserConnectToVoiceChannelEvent extends SystemMessageEvent {
        channel_type: "GROUP",
        extra: {
            type: 'joined_channel',
            body: {
                user_id: string,
                channel_id: string,
                joined_at: number
            }
        }
    }
    export interface UserDisconnectFromVoiceChannelEvent extends SystemMessageEvent {
        channel_type: "GROUP",
        extra: {
            type: "exited_channel",
            body: {
                user_id: string,
                channel_id: string,
                exited_at: number
            }
        }
    }
    export interface UserProfileUpdateEvent extends SystemMessageEvent {
        channel_type: "PERSON",
        extra: {
            type: "user_updated",
            body: {
                user_id: string,
                username: string,
                avatar: string
            }
        }
    }
    export interface SelfJoinedGuildEvent extends SystemMessageEvent {
        channel_type: "PERSON",
        extra: {
            type: "self_joined_guild",
            body: {
                guild_id: string
            }
        }
    }
    export interface SelfExitedGuildEvent extends SystemMessageEvent {
        channel_type: "PERSON",
        extra: {
            type: "self_exited_guild",
            body: {
                guild_id: string
            }
        }
    }
    export interface ButtonClickedEvent extends SystemMessageEvent {
        channel_type: "PERSON",
        extra: {
            type: "message_btn_click",
            body: {
                value: string,
                msg_id: string,
                user_id: string,
                target_id: string,
                user_info: User,
                channel_type: "GROUP" | "PRESON",
                guild_id?: string
            }
        }
    }
}


export namespace RawEmbedding {
    export interface BilibiliVideo {
        type: 'bili-video',
        url: string,
        origin_url: string,
        av_no: string,
        iframe_path: string,
        duration: number,
        title: string,
        pic: string
    }
}

export namespace RawAttachment {
    export interface File {
        type: 'file',
        url: string,
        name: string,
        file_type: string,
        size: number
    }
    export interface Video {
        type: 'video',
        url: string,
        name: string,
        duration: number,
        size: number,
        width: number,
        height: number
    }
}

export namespace RawMention {
    export interface User {
        id: string,
        username: string,
        full_name: string,
        avatar: string
    }
    export interface Role {
        role_id: string,
        name: string,
        color: number,
        position: number,
        hoist: number,
        mentionable: number,
        permissions: number
    }
}

export interface RawReaction {
    emoji: {
        id: string,
        name: string
    },
    count: number,
    me: boolean
}

export type RequestResponse<T = any> = {
    err: Error,
    data?: undefined
} | {
    err?: undefined,
    data: T
}

export interface RawResponse {
    code: number,
    message: string,
    data: any
}

export interface WebSocketConfig {
    type: 'websocket',
    vendor?: 'botroot' | 'hexona' | 'kookts',
    token: string,
    disableSnOrderCheck?: boolean
}

export interface WebHookConfig {
    type: 'webhook',
    port: number,
    token: string,
    verifyToken: string,
    encryptKey: string,
    disableSnOrderCheck?: boolean
}

export type KasumiConfig = WebSocketConfig | WebHookConfig;