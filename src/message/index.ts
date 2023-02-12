import Logger from "bunyan";
import { EventEmitter } from "events";
import Kasumi from "../";
import { WebSocket, MessageType, GuildType } from "../type";
import RawEmisions, { AudioMessageEvent, CardMessageEvent, FileMessageEvent, ImageMessageEvent, MarkdownMessageEvent, PlainTextMessageEvent, SystemMessageEvent, VideoMessageEvent } from "./type";

export interface Message extends EventEmitter {
    on<T extends keyof RawEmisions>(event: T, listener: RawEmisions[T]): this;
    emit<T extends keyof RawEmisions>(event: T, ...args: Parameters<RawEmisions[T]>): boolean;
}

export class Message extends EventEmitter implements Message {
    private client: Kasumi;
    logger: Logger;
    constructor(client: Kasumi) {
        super();
        this.client = client;
        this.logger = new Logger({
            name: 'kasumi.event',
            streams: [{
                stream: process.stdout,
                level: this.client.__bunyan_log_level
            }, {
                stream: process.stderr,
                level: this.client.__bunyan_error_level
            }]
        });
    }
    recievedMessage(e: WebSocket.Signal.Event) {
        const data = e.d;
        if (data.author_id == this.client.userId) return;
        let event;
        switch (data.type) {
            case MessageType.SystemMessage: {
                event = new SystemMessageEvent(data as any, this.client);
                this.emit('systemMessages', event);
                break;
            }
            case MessageType.TextMessage: {
                event = new PlainTextMessageEvent(data as any, this.client);
                this.emit('plainTextMessages', event);
                this.emit('allTextMessages', event);
                break;
            }
            case MessageType.MarkdownMessage: {
                event = new MarkdownMessageEvent(data as any, this.client)
                this.emit('markdownMessages', event);
                this.emit('allTextMessages', event);
                break;
            }
            case MessageType.VideoMessage: {
                event = new VideoMessageEvent(data as any, this.client)
                this.emit('videoMessages', event);
                break;
            }
            case MessageType.AudioMessage: {
                event = new AudioMessageEvent(data as any, this.client)
                this.emit('audioMessages', event);
                break;
            }
            case MessageType.FileMessage: {
                event = new FileMessageEvent(data as any, this.client)
                this.emit('fileMessages', event);
                break;
            }
            case MessageType.ImageMessage: {
                event = new ImageMessageEvent(data as any, this.client)
                this.emit('imageMessages', event);
                break;
            }
            case MessageType.CardMessage: {
                event = new CardMessageEvent(data as any, this.client)
                this.emit('cardMessages', event);
                break;
            }
            default: {
                this.emit('unknownMessages', data);
                this.logger.warn('Recieved unknown event');
                this.logger.warn(data);
            }
        }
        this.emit('allMessages', event);
    }
}

export default Message;