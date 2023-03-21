import Rest from "../../../requestor";
import { RawJoinedChannelResponse } from "./type";

export default class ChannelUser {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    async *joinedChannel(guildId: string, userId: string, page: number = 1, pageSize: number = 50) {
        return this.rest.multiPageRequest<RawJoinedChannelResponse>('/channel-user/get-joined-channel', page, pageSize, {
            guild_id: guildId,
            user_id: userId
        })
    }
}