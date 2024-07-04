import { AttachmentBase } from "./base";

export interface FileAttachment extends AttachmentBase {
    type: "file";
    fileType: string;
    size: number;
    url: string;
}
