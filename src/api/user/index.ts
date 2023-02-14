import { RestError } from "../../error";
import Rest from "../../requestor";
import { RawMeResponse, RawViewResponse } from "./type";

export default class User {
    rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    async me(): Promise<RawMeResponse> {
        return this.rest.get('/user/me'); // revert mark
    }

    async view(userId: string, guildId?: string): Promise<RawViewResponse> {
        return this.rest.get('/user/view', {
            user_id: userId,
            guild_id: guildId
        }); // revert mark
    }

    async offline(): Promise<void> {
        return this.rest.get('/user/offline'); // revert mark
    }
}