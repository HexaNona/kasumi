import { PlainTextMessageEvent, MarkdownMessageEvent } from "../message/type";
import Kasumi from "..";
import { MessageType } from "../../dist/type";

export default class BaseSession {
    args: string[];
    event: PlainTextMessageEvent | MarkdownMessageEvent
    client: Kasumi;

    channelId: string;
    messageId: string;
    userId: string;
    content: string;
    constructor(args: string[], event: PlainTextMessageEvent | MarkdownMessageEvent, client: Kasumi) {
        this.args = args;
        this.event = event;
        this.client = client;
        this.channelId = event.channelId;
        this.userId = event.authorId;
        this.messageId = event.messageId;
        this.content = event.content;
    }
    private async __sendText(content: string, quote: boolean = false, temporary: boolean = false) {
        this.client.rest.message.create(
            MessageType.MarkdownMessage,
            this.channelId,
            content,
            quote ? this.messageId : undefined,
            temporary ? this.userId : undefined
        )
    }
    async send(content: string) {
        return this.__sendText(content);
    }
    async sendTemp(content: string) {
        return this.__sendText(content, false, true);
    }
    async reply(content: string) {
        return this.__sendText(content, true);
    }
    async replyTemp(content: string) {
        return this.__sendText(content, true, true);
    }
}