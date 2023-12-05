import { MultiPageResponse, RequestResponse } from "@ksm/type";
import Rest from "@ksm/requestor";
import { RawInviteCreateResponse, RawInviteListResponseItem } from "./type";

export default class Inivte {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    /**
     * Get a list of invitations
     */
    list({ guildId, channelId, page = 1, pageSize = 50 }: {
        /**
         * Guild ID. At least one of guild ID and channel ID is reqiured
         */
        guildId?: string,
        /**
         * Channel ID. At least one of guild ID and channel ID is reqiured
         */
        channelId?: string,
        /**
         * Page number
         */
        page: number,
        /**
         * Page size
         */
        pageSize: number
    }) {
        return this.rest.multiPageRequest<MultiPageResponse<RawInviteListResponseItem>>('/invite/list', page, pageSize, {
            guild_id: guildId,
            channel_id: channelId
        })
    }

    /**
     * Create a invitation
     */
    async create({ guildId, channelId, expire, useLimit }: {
        /**
         * Guild ID. At least one of guild ID and channel ID is reqiured
         */
        guildId?: string,
        /**
         * Channel ID. At least one of guild ID and channel ID is reqiured
         */
        channelId?: string,
        /**
         * How long after creation before the link expires
         */
        expire?: number,
        /**
         * How many times the link can be used before it expires
         */
        useLimit?: number
    }) {
        return this.rest.post<RawInviteCreateResponse>('/invite/create', {
            guild_id: guildId,
            channel_id: channelId,
            duration: expire,
            setting_times: useLimit
        });
    }

    /**
     * Delete a invitation
     * @param inviteCode The code of the invitation
     * @param guildId Guild ID
     * @param channelId Channel ID
     */
    async delete(inviteCode: string, guildId?: string, channelId?: string) {
        return this.rest.post<void>('/invite/delete', {
            url_code: inviteCode,
            guild_id: guildId,
            channel_id: channelId
        })
    }
}