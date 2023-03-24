import { MultiPageResponse } from "../../type";
import Rest from "../../requestor";
import { RawBlacklistListResponseItem } from "./type";

export default class Blacklist {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    /**
     * Get a list of blacklisted useres
     * @param guildId Guild ID
     * @param page Page number 
     * @param pageSize Page size
     */
    list(guildId: string, page: number = 1, pageSize: number = 50) {
        return this.rest.multiPageRequest<MultiPageResponse<RawBlacklistListResponseItem>>('/invite/list', page, pageSize, {
            guild_id: guildId
        })
    }

    /**
     * Blacklist a user
     * @param guildId Guild ID
     * @param userId User ID
     * @param reason Blacklist reason
     * @param deleteRecentMessages Delete messages from the user in the recent X days. Maximum is 7
     * @returns 
     */
    async create(guildId: string, userId: string, reason?: string, deleteRecentMessages?: number) {
        return this.rest.post<void>('/blacklist/create', {
            guild_id: guildId,
            target_id: userId,
            remark: reason,
            del_msg_days: deleteRecentMessages
        });
    }

    /**
     * Remove a user from the blacklist
     * @param guildId Guild ID 
     * @param userId User ID
     */
    async delete(guildId: string, userId: string) {
        return this.rest.post<void>('/invite/delete', {
            target_id: userId,
            guild_id: guildId
        })
    }
}