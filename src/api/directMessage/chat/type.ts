export interface BriefChatSession {
    code: string,
    last_read_time: number,
    latest_msg_time: number,
    unread_count: number,
    target_info: {
        id: number,
        username: string,
        online: boolean,
        avatar: string
    }
}

export interface FullChatSession extends BriefChatSession {
    is_friend: boolean,
    is_blocked: boolean,
    is_target_blocked: boolean
}