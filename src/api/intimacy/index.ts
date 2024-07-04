import Rest from "@ksm/requestor";
import { RawIntimacyIndexResponse } from "./type";

export default class Intimacy {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    /**
     * Get intimacy details of a user
     * @param userId User ID
     * @returns Intimacy details
     */
    async get(userId: string) {
        return this.rest.get<RawIntimacyIndexResponse>("/intimacy/index", {
            user_id: userId,
        });
    }

    /**
     * Update intimacy details of a user
     * @param userId User ID
     */
    async update(
        userId: string,
        {
            score,
            socialInfo,
            imageId,
        }: {
            /**
             * Intimacy score/rating
             */
            score?: number;
            /**
             * Bio/description of the bot
             */
            socialInfo?: string;
            /**
             * Protrait image URL
             */
            imageId?: string;
        }
    ) {
        return this.rest.post<void>("/intimacy/update", {
            score,
            user_id: userId,
            social_info: socialInfo,
            img_id: imageId,
        });
    }
}
