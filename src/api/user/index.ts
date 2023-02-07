import { AxiosInstance } from "axios";
import Rest from "../../requestor";
import { RawMeResponse, RawViewResponse } from "./type";

export default class User extends Rest {
    constructor(requestor: AxiosInstance) {
        super(requestor);
    }

    async me(): Promise<RawMeResponse> {
        return this.get('/user/me');
    }

    async view(userId: string, guildId?: string): Promise<RawViewResponse> {
        return this.get('/user/view', {
            user_id: userId,
            guild_id: guildId
        });
    }

    async offline(): Promise<void> {
        this.get('/user/offline');
    }
}