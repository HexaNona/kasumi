import { ImageAttachment } from "@ksm/websocket-botroot/types/attachment/image";
import { UserInGuildNonStandard } from "@ksm/websocket-botroot/types/common";
import { MessageType } from "@ksm/websocket-botroot/types/MessageType";
import { MessageBase } from "./base";

export interface ImageMessage extends MessageBase {
    type: MessageType.image;
    code: string;
    content: string;
    author: UserInGuildNonStandard;
    attachment: ImageAttachment;
}
