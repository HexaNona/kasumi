import { RequestResponse } from "@ksm/type";
import Rest from "@ksm/requestor";
import { RawChannelRoleResponse, RawChannelRoleIndexResponse } from "./type";

export default class ChannelRole {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    /**
     * Get channel permission
     * @param channelId Channel ID
     * @returns Role/user permission override
     */
    async list(channelId: string): Promise<RequestResponse<RawChannelRoleIndexResponse>> {
        return this.rest.get('/channel-role/index', {
            channel_id: channelId
        });
    }

    private async __create<T extends 'role_id' | 'user_id'>(channelId: string, type: T, value: string): Promise<RequestResponse<RawChannelRoleResponse[T]>> {
        return this.rest.post('/channel-role/create', {
            channel_id: channelId, type, value
        })
    }

    /**
     * Create a new role permission override
     * @param channelId Channel ID
     * @param roleId Role ID
     * @returns override details
     */
    async createRole(channelId: string, roleId: string) {
        return this.__create(channelId, 'role_id', roleId)
    }

    /**
     * Create a new user permission override
     * @param channelId Channel ID
     * @param userId User ID
     * @returns override details
     */
    async createUser(channelId: string, userId: string) {
        return this.__create(channelId, 'user_id', userId);
    }

    private async __update<T extends 'role_id' | 'user_id'>(channelId: string, type: T, value: string, allow: number, deny: number): Promise<RequestResponse<RawChannelRoleResponse[T]>> {
        return this.rest.post('/channel-role/update', {
            type, value, allow, deny,
            channel_id: channelId
        })
    }

    /**
     * Update a role permission override
     * @param channelId Channel ID
     * @param roleId Role ID
     * @param allow Allowed [permissions](https://developer.kookapp.cn/doc/http/guild-role#%E6%9D%83%E9%99%90%E8%AF%B4%E6%98%8E)
     * @param deny Denied [permissions](https://developer.kookapp.cn/doc/http/guild-role#%E6%9D%83%E9%99%90%E8%AF%B4%E6%98%8E)
     * @returns override details
     */
    async updateRole(channelId: string, roleId: string, allow: number = 0, deny: number = 0) {
        return this.__update(channelId, 'role_id', roleId, allow, deny)
    }

    /**
     * Update a user permission override
     * @param channelId Channel ID
     * @param userId User ID
     * @param allow Allowed [permissions](https://developer.kookapp.cn/doc/http/guild-role#%E6%9D%83%E9%99%90%E8%AF%B4%E6%98%8E)
     * @param deny Denied [permissions](https://developer.kookapp.cn/doc/http/guild-role#%E6%9D%83%E9%99%90%E8%AF%B4%E6%98%8E)
     * @returns override details
     */
    async updateUser(channelId: string, userId: string, allow: number = 0, deny: number = 0) {
        return this.__update(channelId, 'user_id', userId, allow, deny)
    }

    private async __delete(channelId: string, type: 'role_id' | 'user_id', value: string): Promise<RequestResponse<void>> {
        return this.rest.post('/channel-role/delete', {
            channel_id: channelId,
            type, value
        })
    }


    /**
     * Delete a role permission override
     * @param channelId Channel ID
     * @param roleId Role ID
     */
    async deleteRole(channelId: string, roleId: string) {
        return this.__delete(channelId, 'role_id', roleId);
    }

    /**
     * Delete a user permission override
     * @param channelId Channel ID
     * @param userId User ID
     */
    async deleteUser(channelId: string, userId: string) {
        return this.__delete(channelId, 'user_id', userId);
    }
}