import Kasumi from "../";
import { WebSocket, MessageType, User, GuildType } from "../type";

export default interface RawEmisions {
    allMessages(event: unknown): void;
    unknownMessages(event: unknown): void;
    systemMessages(event: SystemMessageEvent): void;
    audioMessages(event: AudioMessageEvent): void;
    videoMessages(event: VideoMessageEvent): void;
    fileMessages(event: FileMessageEvent): void;
    imageMessages(event: ImageMessageEvent): void;
    plainTextMessages(event: PlainTextMessageEvent): void;
    markdownMessages(event: MarkdownMessageEvent): void;
    allTextMessages(event: PlainTextMessageEvent | MarkdownMessageEvent): void;
    cardMessages(event: CardMessageEvent): void;
    buttonClicked(event: ButtonClickedEvent): void;
    actionMessages(event: ActionMessageEvent): void;
}
export class BaseMessageEvent {
    messageType: MessageType;
    channelType: GuildType;
    messageId: string;
    timestamp: number;
    content: string;
    rawEvent: WebSocket.MessageEvent
    protected client: Kasumi;
    constructor(rawEvent: WebSocket.MessageEvent, client: Kasumi) {
        this.messageType = rawEvent.type
        this.channelType = rawEvent.channel_type;
        this.messageId = rawEvent.msg_id;
        this.content = rawEvent.content;
        this.timestamp = parseInt(rawEvent.msg_timestamp);
        this.client = client;
        this.rawEvent = rawEvent
    }
}

export class SystemMessageEvent extends BaseMessageEvent {
    messageType = MessageType.SystemMessage;
    guildId?: string;
    body: any;
    constructor(rawEvent: WebSocket.SystemMessageEvent, client: Kasumi) {
        super(rawEvent, client);
        this.body = rawEvent.extra.body;
        if (this.channelType == 'GROUP') this.guildId = rawEvent.target_id
    }
}

export class ButtonClickedEvent extends SystemMessageEvent {
    value: string;
    targetMsgId: string;
    channelId: string;
    authorId: string;
    author: User;
    constructor(rawEvent: WebSocket.ButtonClickedEvent, client: Kasumi) {
        super(rawEvent, client);
        this.value = rawEvent.extra.body.value;
        this.targetMsgId = rawEvent.extra.body.msg_id;
        this.authorId = rawEvent.extra.body.user_id;
        this.author = rawEvent.extra.body.user_info;
        this.channelId = rawEvent.extra.body.target_id;
        this.guildId = rawEvent.extra.body.guild_id;
    }
}

class UserMessageEvent extends BaseMessageEvent {
    channelType: Exclude<GuildType, 'BOARDCAST'>;
    channelId: string;
    author: User;
    authorId: string;
    guildId?: string;
    mention?: any[];
    mentionRoles?: any[];
    isMentionAll?: boolean;
    isMentionHere?: boolean;
    private isGroupMessage(object: WebSocket.NormalMessageEvent<WebSocket.NormalMessageType, GuildType>): object is WebSocket.NormalMessageEvent<WebSocket.NormalMessageType, 'GROUP'> {
        return object.channel_type == 'GROUP';
    }
    public async delete() {
        this.client.API.message.delete(this.messageId);
    }
    public async reply(content: string, tempUpdateTargetUser?: string) {
        if (this.channelType == 'GROUP') return this.client.API.message.create(this.messageType, this.channelId, content, this.messageId, tempUpdateTargetUser);
        else if (this.channelType == 'PERSON') return;
    }
    public async reactionUserList(emojiId: string) {
        return this.client.API.message.reactionUserList(this.messageId, emojiId);
    }
    public async addReaction(emojiId: string) {
        return this.client.API.message.addReaction(this.messageId, emojiId);
    }
    public async deleteReaction(emojiId: string, userId?: string) {
        return this.client.API.message.deleteReaction(this.messageId, emojiId, userId);
    }
    constructor(rawEvent: WebSocket.NormalMessageEvent<WebSocket.NormalMessageType, GuildType>, client: Kasumi) {
        super(rawEvent, client);
        if (this.isGroupMessage(rawEvent)) {
            this.guildId = rawEvent.extra.guild_id;
            this.mention = rawEvent.extra.mention;
            this.isMentionAll = rawEvent.extra.mention_all;
            this.isMentionHere = rawEvent.extra.mention_here;
            this.mentionRoles = rawEvent.extra.mention_roles;
        }
        this.authorId = rawEvent.author_id;
        this.channelType = rawEvent.channel_type
        this.channelId = rawEvent.target_id;
        this.author = rawEvent.extra.author;
    }
}

export class PlainTextMessageEvent extends UserMessageEvent {
    messageType = MessageType.TextMessage;
    constructor(rawEvent: WebSocket.NormalMessageEvent<MessageType.TextMessage, GuildType>, client: Kasumi) {
        super(rawEvent, client);
    }
}


export class MarkdownMessageEvent extends UserMessageEvent {
    messageType = MessageType.MarkdownMessage;
    constructor(rawEvent: WebSocket.NormalMessageEvent<MessageType.MarkdownMessage, GuildType>, client: Kasumi) {
        super(rawEvent, client);
    }
}

export class ImageMessageEvent extends UserMessageEvent {
    messageType = MessageType.ImageMessage;
    constructor(rawEvent: WebSocket.NormalMessageEvent<MessageType.ImageMessage, GuildType>, client: Kasumi) {
        super(rawEvent, client);
    }
}

export class AudioMessageEvent extends UserMessageEvent {
    messageType = MessageType.AudioMessage;
    constructor(rawEvent: WebSocket.NormalMessageEvent<MessageType.AudioMessage, GuildType>, client: Kasumi) {
        super(rawEvent, client);
    }
}

export class VideoMessageEvent extends UserMessageEvent {
    messageType = MessageType.VideoMessage;
    constructor(rawEvent: WebSocket.NormalMessageEvent<MessageType.VideoMessage, GuildType>, client: Kasumi) {
        super(rawEvent, client);
    }
}


export class FileMessageEvent extends UserMessageEvent {
    messageType = MessageType.FileMessage;
    constructor(rawEvent: WebSocket.NormalMessageEvent<MessageType.FileMessage, GuildType>, client: Kasumi) {
        super(rawEvent, client);
    }
}


export class CardMessageEvent extends UserMessageEvent {
    messageType = MessageType.CardMessage;
    constructor(rawEvent: WebSocket.NormalMessageEvent<MessageType.CardMessage, GuildType>, client: Kasumi) {
        super(rawEvent, client);
    }
}

export class ActionMessageEvent extends UserMessageEvent {
    messageType = MessageType.ActionMessage;
    constructor(rawEvent: WebSocket.NormalMessageEvent<MessageType.ActionMessage, GuildType>, client: Kasumi) {
        super(rawEvent, client);
    }
}