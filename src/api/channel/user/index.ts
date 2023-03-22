import Rest from "../../../requestor";
import { RawJoinedChannelResponse } from "./type";

/**
 * APIs related to users and voice channels
 */
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
    async *joinedChannel(guildId: string, userId: string, page: number = 1, pageSize: number = 50) {
        return this.rest.multiPageRequest<RawJoinedChannelResponse>('/channel-user/get-joined-channel', page, pageSize, {
            guild_id: guildId,
            user_id: userId
        })
    }
}