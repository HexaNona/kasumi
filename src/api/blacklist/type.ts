import { User } from "@ksm/type";

export interface RawBlacklistListResponseItem {
    user_id: string;
    create_time: number;
    remark: string;
    uesr: User;
}
