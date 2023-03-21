import Rest from "../../requestor";
import { RawUserMeResponse, RawUserViewResponse } from "./type";

export default class User {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    async me(): Promise<RawUserMeResponse | undefined> {
        return this.rest.get('/user/me').catch((e) => {
            this.rest.logger.error(e);
            return undefined;
        });
    }

    async view(userId: string, guildId?: string): Promise<RawUserViewResponse | undefined> {
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