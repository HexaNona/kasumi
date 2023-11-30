import { PlainTextMessageEvent, MarkdownMessageEvent, ButtonClickedEvent } from "../message/type";
import Kasumi from "../client";
import { GuildType, MessageType } from "../type";
import Card from "../card";
import { User } from "../type";

export default class BaseSession {
    args: string[];
    event: PlainTextMessageEvent | MarkdownMessageEvent | ButtonClickedEvent
    client: Kasumi<any>;

    guildId?: string;
    channelId: string;
    messageId: string;
    authorId: string;
    content: string;
    author: User;

    channelType: GuildType;
    constructor(args: string[], event: PlainTextMessageEvent | MarkdownMessageEvent | ButtonClickedEvent, client: Kasumi<any>) {
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
        if (content instanceof Card || content instanceof Array) {
            messageType = MessageType.CardMessage;
        } else messageType = MessageType.MarkdownMessage;
        if (this.channelType == 'GROUP') {
            return this.client.API.message.create(
                messageType,
                this.channelId,
                content,
                quote ? this.messageId : undefined,
                temporary ? this.authorId : undefined
            );
        } else {
            return this.client.API.directMessage.create(
                messageType,
                this.authorId,
                content,
                quote ? this.messageId : undefined,
                temporary ? this.authorId : undefined
            );
        }
    }
    private async __update(messageId: string, content: string | Card | Card[], reply?: boolean, temporary?: boolean) {
        if (this.channelType == 'GROUP') {
            return this.client.API.message.update(
                messageId,
                content,
                reply ? this.messageId : undefined,
                temporary ? this.authorId : undefined
            );
        } else {
            return this.client.API.directMessage.update(
                messageId,
                content,
                reply ? this.messageId : undefined
            );
        }
    }
    async update(messageId: string, content: string | Card | Card[], reply: boolean = false) {
        return this.__update(messageId, content, reply);
    }
    async updateTemp(messageId: string, content: string | Card | Card[], reply: boolean = false) {
        return this.__update(messageId, content, reply, true);
    }

    async send(content: string | Card | Card[], mention?: boolean) {
        if (content instanceof Card || content instanceof Array) {
            return this.__send(content);
        } else {
            return this.__send(mention ? `(met)${this.authorId}(met) ${content}` : content);
        }
    }
    async sendTemp(content: string | Card | Card[], mention?: boolean) {
        if (content instanceof Card || content instanceof Array) {
            return this.__send(content);
        } else {
            return this.__send(mention ? `(met)${this.authorId}(met) ${content}` : content, false, true);
        }
    }
    async reply(content: string | Card | Card[], mention?: boolean) {
        if (this.event instanceof ButtonClickedEvent) return this.send(content, mention);
        else return this.__send(content, true);
    }
    async replyTemp(content: string | Card | Card[], mention?: boolean) {
        if (this.event instanceof ButtonClickedEvent) return this.sendTemp(content, mention);
        else return this.__send(content, true, true);
    }
}