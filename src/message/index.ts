import Logger from "bunyan";
import Kasumi from "../client";
import { WebSocket, MessageType } from "../type";
import RawEmisions, { ActionMessageEvent, AudioMessageEvent, ButtonClickedEvent, CardMessageEvent, FileMessageEvent, ImageMessageEvent, MarkdownMessageEvent, PlainTextMessageEvent, SystemMessageEvent, VideoMessageEvent } from "./type";
import EventEmitter2 from "eventemitter2";

export interface Message extends EventEmitter2 {
    /**
     * @deprecated Use `Kasumi.on` instead. 
     */
    on<T extends keyof RawEmisions>(event: T, listener: RawEmisions[T]): this;
    /**
     * @deprecated Use `Kasumi.emit` instead. 
     */
    emit<T extends keyof RawEmisions>(event: T, ...args: Parameters<RawEmisions[T]>): boolean;
}

export class Message extends EventEmitter2 implements Message {
    private client: Kasumi<any>;
    logger: Logger;

    private __is_button_clicked_event(event: WebSocket.SystemMessageEvent): event is WebSocket.ButtonClickedEvent {
        return event.extra.type == "message_btn_click";
    }
    constructor(client: Kasumi<any>) {
        super();
        this.client = client;
        this.logger = this.client.getLogger('event');
    }
    recievedMessage(e: WebSocket.Signal.Event) {
        const data = e.d;
        if (data.author_id == this.client.me.userId) return;
        let event;
        switch (data.type) {
            case MessageType.SystemMessage: {
                if (this.__is_button_clicked_event(data)) {
                    event = new ButtonClickedEvent(data, this.client);
                    this.emit('buttonClicked', event)
                    this.client.emit('event.button', event);
                } else {
                    event = new SystemMessageEvent(data, this.client);
                    this.emit('systemMessages', event);
                    this.client.emit('event.system', event);
                }
                break;
            }
            case MessageType.TextMessage: {
                event = new PlainTextMessageEvent(data as any, this.client);
                this.emit('plainTextMessages', event);
                this.emit('allTextMessages', event);
                this.client.emit('message.text', event);
                this.client.emit('message.text.plain', event);
                break;
            }
            case MessageType.MarkdownMessage: {
                event = new MarkdownMessageEvent(data as any, this.client);
                this.emit('markdownMessages', event);
                this.emit('allTextMessages', event);
                this.client.emit('message.text', event);
                this.client.emit('message.text.markdown', event);
                break;
            }
            case MessageType.VideoMessage: {
                event = new VideoMessageEvent(data as any, this.client)
                this.emit('videoMessages', event);
                this.client.emit('message.video', event);
                break;
            }
            case MessageType.AudioMessage: {
                event = new AudioMessageEvent(data as any, this.client)
                this.emit('audioMessages', event);
                this.client.emit('message.audio', event);
                break;
            }
            case MessageType.FileMessage: {
                event = new FileMessageEvent(data as any, this.client)
                this.emit('fileMessages', event);
                this.client.emit('message.file', event);
                break;
            }
            case MessageType.ImageMessage: {
                event = new ImageMessageEvent(data as any, this.client)
                this.emit('imageMessages', event);
                this.client.emit('message.image', event);
                break;
            }
            case MessageType.CardMessage: {
                event = new CardMessageEvent(data as any, this.client)
                this.emit('cardMessages', event);
                this.client.emit('message.card', event);
                break;
            }
            case MessageType.ActionMessage: {
                event = new ActionMessageEvent(data as any, this.client)
                this.emit('actionMessages', event);
                this.client.emit('event.action', event);
                break;
            }
            default: {
                this.emit('unknownMessages', data);
                this.client.emit('message.unknown', event);
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