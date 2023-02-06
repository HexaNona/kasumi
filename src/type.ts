export enum MessageType {
    TextMessage = 1,
    ImageMessage = 2,
    VideoMessage = 3,
    FileMessage = 4,
    AudioMessage = 8,
    MarkdownMessage = 9,
    CardMessage = 10,
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
    channels: []
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

export interface RawGatewayResponse {
    url: string
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
        RecievingMessage = 2,
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
        content: string,
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
        type: T,
        extra: MessageEventChannelTypeExtra<T>[K]
    }

    export interface SystemMessageEvent extends MessageEvent {
        type: MessageType.SystemMessage,
        extra: {
            type: string,
            body: any
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

export interface RawListResponse {
    items: Array<RawMessageItem>
}

export interface RawViewResponse extends User {
    os: string,
    decorations_id_map: {
        join_boice: number,
        avatar_border: number,
        background: number
    }
}

export interface RawMeResponse extends User {
    banner: string,
    decorations_id_map: null,
    bot_status: number,
    tag_info?: {
        color: string,
        bg_color: string,
        text: string
    },
    mobile_verified: boolean,
    client_id: string,
    mobile_prefix: string,
    mobile: string,
    privacy_game_activity: number,
    privacy_music_activity: number,
    enable_desktop_notification: boolean,
    audio_setting: string,
    auto_exit_audio_channel: boolean,
    invited_count: number,
    need_guide: boolean,
    created_guild: boolean,
    experience_improve: boolean,
    friend_setting: {
        all: boolean,
    },
    chat_setting: string,
    accompaniment: boolean,
    mobile_not_notify: boolean,
    mobile_notify_setting: number,
    new_join: any[],
    i18n: boolean,
    has_new_policy: boolean
}

export interface RawResponse {
    code: number,
    message: string,
    data: any
}