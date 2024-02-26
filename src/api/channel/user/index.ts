import Rest from "@ksm/requestor";
import { RawJoinedChannelResponse } from "./type";

export default class ChannelUser {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    /**
     * Get joined voice channel of a user
     * @param guildId Guild ID
     * @param userId User ID
     * @param page Page number
     * @param pageSize Page Size
     */
    joinedChannel(guildId: string, userId: string, page?: number, pageSize?: number) {
        return this.rest.multiPageRequest<RawJoinedChannelResponse>('/channel-user/get-joined-channel', page, pageSize, {
            guild_id: guildId,
            user_id: userId
        })
    }
}