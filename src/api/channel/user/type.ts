import { FullChannel, MultiPageResponse } from "../../../type";


export interface RawJoinedChannelResponse extends MultiPageResponse {
    items: FullChannel[]
}