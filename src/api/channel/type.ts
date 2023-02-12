import { BriefChannel, MultiPageResponse } from "type";


export interface RawListResponse extends MultiPageResponse {
    items: BriefChannel[]
}