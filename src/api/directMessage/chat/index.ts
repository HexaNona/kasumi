import { MultiPageResponse } from "@ksm/type";
import Rest from "@ksm/requestor";
import { BriefChatSession, FullChatSession } from "./type";

export default class UserChat {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    /**
     * Get a list of direct message session
     * @param page Page number
     * @param pageSize Page size
     */
    list(page?: number, pageSize?: number) {
        return this.rest.multiPageRequest<MultiPageResponse<BriefChatSession>>(
            "/user-chat/list",
            page,
            pageSize
        );
    }

    /**
     * View details of a direct message session
     * @param code DM session code
     * @returns Session details
     */
    async view(code: string) {
        return this.rest.post<FullChatSession>("/user-chat/view", {
            chat_code: code,
        });
    }

    /**
     * Create a direct message session
     * @param userId User ID
     * @returns Session details
     */
    async create(userId: string) {
        return this.rest.post<FullChatSession>("/user-chat/create", {
            target_id: userId,
        });
    }

    /**
     * Delete a direct message session
     * @param code Session code
     */
    async delete(code: string) {
        return this.rest.post<void>("/uset-chat/delete", {
            chat_code: code,
        });
    }
}
