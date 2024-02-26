import { RawMention, MultiPageResponse } from "@ksm/type";
import Rest from "@ksm/requestor";
import { RawGuildRoleManipulateResponse } from "./type";

export default class GuildRole {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    /**
     * Get a list of roles in a guild
     * @param guildId Guild ID
     * @param page Page number
     * @param pageSize Page size
     */
    list(guildId: string, page?: number, pageSize?: number) {
        return this.rest.multiPageRequest<MultiPageResponse<RawMention.Role>>('/guild-role/list', page, pageSize, {
            guild_id: guildId
        });
    }

    /**
     * Create a role in a guild
     * @param guildId Guild ID
     * @param name Role name
     * @returns Role details
     */
    create(guildId: string, name?: string) {
        return this.rest.post<RawMention.Role>('/guild-role/create', {
            guild_id: guildId, name
        })
    }

    /**
     * Update details of a role
     * @param guildId Guild ID
     * @param roleId Role ID
     * @returns Role details
     */
    update(guildId: string, roleId: string, { name, color, hoist, mentionable, permissions }: {
        /**
         * Role name
         */
        name?: string,
        /**
         * Role display color
         */
        color?: number,
        /**
         * Display role seperately
         */
        hoist?: boolean,
        /**
         * Mentionable by anyone
         */
        mentionable?: boolean,
        /**
         * Role [permissions](https://developer.kookapp.cn/doc/http/guild-role#%E6%9D%83%E9%99%90%E8%AF%B4%E6%98%8E)
         */
        permissions?: number
    }) {
        return this.rest.post<RawMention.Role>('/guild-role/update', {
            guild_id: guildId,
            role_id: roleId,
            name, color, permissions,
            hoist: hoist === undefined ? hoist : (hoist === true ? 1 : 0),
            mentionable: mentionable === undefined ? mentionable : (mentionable === true ? 1 : 0)
        })
    }

    /**
     * Delete a role
     * @param guildId Guild ID
     * @param roleId Role ID
     */
    delete(guildId: string, roleId: string) {
        return this.rest.post<void>('/guild-role/delete', {
            guild_id: guildId,
            role_id: roleId
        })
    }

    /**
     * Grant a user a role
     * @param guildId Guild ID
     * @param roleId Role ID
     * @param userId User ID
     * @returns Role ID list of the user in the guild
     */
    grant(guildId: string, roleId: string, userId: string) {
        return this.rest.post<RawGuildRoleManipulateResponse>('/guild-role/grant', {
            guild_id: guildId,
            role_id: roleId,
            user_id: userId
        })
    }

    /**
     * Revoke a user from a role
     * @param guildId Guild ID
     * @param roleId Role ID
     * @param userId User ID
     * @returns Role ID list of the user in the guild
     */
    revoke(guildId: string, roleId: string, userId: string) {
        return this.rest.post<RawGuildRoleManipulateResponse>('/guild-role/revoke', {
            guild_id: guildId,
            role_id: roleId,
            user_id: userId
        });
    }
}