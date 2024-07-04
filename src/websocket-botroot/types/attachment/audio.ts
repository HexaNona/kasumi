import { AttachmentBase } from "./base";

export interface AudioAttachment extends AttachmentBase {
    type: string;
    mimeType: string;
    voice: string;
    duration: number;
}
