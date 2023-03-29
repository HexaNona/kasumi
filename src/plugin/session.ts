import { PlainTextMessageEvent, MarkdownMessageEvent, ButtonClickedEvent } from "../message/type";
import Kasumi from "..";
import { GuildType, MessageType } from "../type";
import Card from "../card";
import { User } from "../type";

export default class BaseSession {
    args: string[];
    event: PlainTextMessageEvent | MarkdownMessageEvent | ButtonClickedEvent
    client: Kasumi;

    guildId?: string;
    channelId: string;
    messageId: string;
    authorId: string;
    content: string;
    author: User;

    channelType: GuildType;
    constructor(args: string[], event: PlainTextMessageEvent | MarkdownMessageEvent | ButtonClickedEvent, client: Kasumi) {
        this.args = args;
        this.event = event;
        this.client = client;
        this.channelId = event.channelId;
        this.authorId = event.authorId;
        this.messageId = event.messageId;
        this.content = event.content;
        this.author = event.author;
        this.guildId = event.guildId;
        this.channelType = event.channelType;
    }
    private async __send(content: string | Card | Card[], quote: boolean = false, temporary: boolean = false) {
        let messageType;
        if (content instanceof Card || content instanceof Array<Card>) messageType = MessageType.CardMessage;
        else messageType = MessageType.MarkdownMessage;
        return this.client.API.message.create(
            messageType,
            this.channelId,
            content,
            quote ? this.messageId : undefined,
            temporary ? this.authorId : undefined
        );
    }
    async update(messageId: string, content: string | Card | Card[], reply: boolean = false) {
        return this.client.API.message.update(
            messageId,
            content,
            reply ? this.messageId : undefined
        )
    }
    async updateTemp(messageId: string, content: string | Card | Card[], reply: boolean = false) {
        return this.client.API.message.update(
            messageId,
            content,
            reply ? this.messageId : undefined,
            this.authorId
        )
    }

    async send(content: string | Card | Card[]) {
        return this.__send(content);
    }
    async sendTemp(content: string | Card | Card[]) {
        return this.__send(content, false, true);
    }
    async reply(content: string | Card | Card[]) {
        return this.__send(content, true);
    }
    async replyTemp(content: string | Card | Card[]) {
        return this.__send(content, true, true);
    }
}