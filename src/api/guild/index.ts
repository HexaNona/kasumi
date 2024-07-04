import Rest from "@ksm/requestor";
import GuildBoost from "./boost";
import GuildMute from "./mute";
import { RequestResponse } from "@ksm/type";
import {
    RawGuildListResponse,
    RawGuildUserListResponse,
    RawGuildViewResponse,
} from "./type";
import GuildEmoji from "./emoji";
import GuildRole from "./role";

export default class Guild {
    private rest: Rest;
    boost: GuildBoost;
    emoji: GuildEmoji;
    mute: GuildMute;
    role: GuildRole;
    constructor(rest: Rest) {
        this.rest = rest;
        this.boost = new GuildBoost(rest);
        this.emoji = new GuildEmoji(rest);
        this.mute = new GuildMute(rest);
        this.role = new GuildRole(rest);
    }

    /**
     * Get a list of guilds of the bot
     * @param page Page number
     * @param pageSize Page size, maximum is 50
     */
    list(page?: number, pageSize?: number) {
        return this.rest.multiPageRequest<RawGuildListResponse>(
            "/guild/list",
            page,
            pageSize
        );
    }

    /**
     * View guild detail
     * @param guildId Guild ID
     * @returns Details of a guild
     */
    async view(
        guildId: string
    ): Promise<RequestResponse<RawGuildViewResponse>> {
        return this.rest.get("/guild/view", { guild_id: guildId });
    }

    private readonly __desc_asc_map = {
        desc: 0,
        asc: 1,
    };
    private __get_desc_asc_map(
        input: "desc" | "asc" | undefined
    ): number | undefined {
        if (input) return this.__desc_asc_map[input];
        else return undefined;
    }

    /**
     * Get a list of users in the guild or channel
     */
    userList({
        guildId,
        channelId,
        search,
        roleId,
        mobileVerified,
        lastSeen,
        joinTime,
        page,
        pageSize,
        userId,
    }: {
        /**
         * Guild ID
         */
        guildId: string;
        /**
         * Channel Id
         */
        channelId?: string;
        /**
         * Keyword to search for a user
         */
        search?: string;
        /**
         * Role ID
         */
        roleId?: number;
        /**
         * To get only verified users or unverified users
         *
         * do not provide = both
         */
        mobileVerified?: boolean;
        /**
         * Sort by last seen time
         */
        lastSeen?: "desc" | "asc";
        /**
         * Sort by join time
         */
        joinTime?: "desc" | "asc";
        /**
         * Page number
         */
        page?: number;
        /**
         * Page size
         */
        pageSize?: number;
        /**
         * User ID
         */
        userId?: number;
    }) {
        return this.rest.multiPageRequest<RawGuildUserListResponse>(
            "/guild/user-list",
            page,
            pageSize,
            {
                guild_id: guildId,
                channel_id: channelId,
                search,
                role_id: roleId,
                mobile_verified:
                    mobileVerified === undefined
                        ? undefined
                        : mobileVerified === true
                          ? 1
                          : 0,
                active_time: this.__get_desc_asc_map(lastSeen),
                joined_at: this.__get_desc_asc_map(joinTime),
                filter_user_id: userId,
            }
        );
    }

    /**
     * Set a user's nickname
     * @param guildId Guild ID
     * @param nickname The new nickname. Set to undefined to remove nickname
     * @param userId User ID
     */
    async nickname(
        guildId: string,
        nickname?: string,
        userId?: string
    ): Promise<RequestResponse<void>> {
        return this.rest.post("/guild/nickname", {
            guild_id: guildId,
            nickname,
            user_id: userId,
        });
    }

    /**
     * Leave a guild
     * @param guildId Guild ID
     */
    async leave(guildId: string): Promise<RequestResponse<void>> {
        return this.rest.post("/guild/leave", {
            guild_id: guildId,
        });
    }

    /**
     * Kick a user out of a guild
     * @param guildId Guild ID
     * @param userId User ID
     */
    async kick(
        guildId: string,
        userId: string
    ): Promise<RequestResponse<void>> {
        return this.rest.post("/guild/kickout", {
            guild_id: guildId,
            target_id: userId,
        });
    }
}
