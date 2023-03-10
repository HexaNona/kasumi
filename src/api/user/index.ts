import { RestError } from "../../error";
import Rest from "../../requestor";
import { RawMeResponse, RawViewResponse } from "./type";

export default class User {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    async me(): Promise<RawMeResponse | undefined> {
        return this.rest.get('/user/me').catch((e) => {
            this.rest.logger.error(e);
            return undefined;
        });
    }

    async view(userId: string, guildId?: string): Promise<RawViewResponse | undefined> {
        return this.rest.get('/user/view', {
            user_id: userId,
            guild_id: guildId
        }).catch((e) => {
            this.rest.logger.error(e);
            return undefined;
        });
    }

    async offline(): Promise<void> {
        return this.rest.get('/user/offline').catch((e) => {
            this.rest.logger.error(e);
        });
    }
}