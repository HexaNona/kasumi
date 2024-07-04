import { RequestResponse } from "@ksm/type";
import Rest from "@ksm/requestor";
import { RawUserMeResponse, RawUserViewResponse } from "./type";

export default class User {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    async me(): Promise<RequestResponse<RawUserMeResponse>> {
        return this.rest.get("/user/me");
    }

    async view(
        userId: string,
        guildId?: string
    ): Promise<RequestResponse<RawUserViewResponse>> {
        return this.rest.get("/user/view", {
            user_id: userId,
            guild_id: guildId,
        });
    }

    async offline(): Promise<RequestResponse<void>> {
        return this.rest.post("/user/offline");
    }
}
