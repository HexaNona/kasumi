import { ActionMessageEvent, AudioMessageEvent, ButtonClickedEvent, CardMessageEvent, FileMessageEvent, ImageMessageEvent, MarkdownMessageEvent, PlainTextMessageEvent, SystemMessageEvent, VideoMessageEvent } from "@ksm/message/type";

interface ConnectEvent {
    type: string,
    vendor: string,
    bot: {
        userId: string,
        username: string,
        identifyNum: string,
        avatar: string
    }
}
export interface WebSocketConnectEvent extends ConnectEvent {
    type: 'websocket',
    vendor: 'hexona' | 'botroot' | 'kookts',
    sessionId?: string,
}
export interface WebHookConnectEvent extends ConnectEvent {
    type: 'webhook',
    vendor: 'hexona'
}
export interface RawEmisions {
    "connect.*": (event: WebHookConnectEvent | WebSocketConnectEvent) => void;
    "connect.websocket": (event: WebSocketConnectEvent) => void;
    "connect.webhook": (event: WebHookConnectEvent) => void;

    "message.*": (event: unknown) => void;
    "message.unknown": (event: unknown) => void;

    "message.audio": (event: AudioMessageEvent) => void;
    "message.video": (event: VideoMessageEvent) => void;
    "message.file": (event: FileMessageEvent) => void;
    "message.image": (event: ImageMessageEvent) => void;


    "message.text": (event: PlainTextMessageEvent | MarkdownMessageEvent) => void;
    "message.text.*": (event: PlainTextMessageEvent | MarkdownMessageEvent) => void;
    "message.text.plain": (event: PlainTextMessageEvent) => void;
    "message.text.markdown": (event: MarkdownMessageEvent) => void;

    "message.card": (event: CardMessageEvent) => void;

    "event.system": (event: SystemMessageEvent) => void;
    "event.button": (event: ButtonClickedEvent) => void;
    "event.action": (event: ActionMessageEvent) => void;
}