import Logger from "bunyan";
import { EventEmitter } from "events";
import Kasumi from "../";
import { WebSocket, MessageType } from "../type";
import RawEmisions, { AudioMessageEvent, ButtonClickedEvent, CardMessageEvent, FileMessageEvent, ImageMessageEvent, MarkdownMessageEvent, PlainTextMessageEvent, SystemMessageEvent, VideoMessageEvent } from "./type";

export interface Message extends EventEmitter {
    on<T extends keyof RawEmisions>(event: T, listener: RawEmisions[T]): this;
    emit<T extends keyof RawEmisions>(event: T, ...args: Parameters<RawEmisions[T]>): boolean;
}

export class Message extends EventEmitter implements Message {
    private client: Kasumi;
    logger: Logger;

    private __is_button_clicked_event(event: WebSocket.SystemMessageEvent): event is WebSocket.ButtonClickedEvent {
        return event.extra.type == "message_btn_click";
    }
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
                if (this.__is_button_clicked_event(data)) {
                    event = new ButtonClickedEvent(data, this.client);
                    this.emit('buttonClicked', event)
                } else {
                    event = new SystemMessageEvent(data, this.client);
                    this.emit('systemMessages', event);
                }
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
        switch (data.type) {
            case MessageType.SystemMessage: break;
            default: this.emit('allMessages', event);
        }
    }
}

export default Message;