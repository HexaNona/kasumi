import { User } from "@ksm/type";

export interface RawChannelRoleIndexResponse {
    permission_overwrites: {
        role_id: number;
        allow: number;
        deny: number;
    }[];
    permission_users: {
        user: User;
        allow: number;
        deny: number;
    }[];
    permission_sync: number;
}

export interface RawChannelRoleResponse {
    role_id: RawChannelRoleRoleResponse;
    user_id: RawChannelRoleUserResponse;
}

export interface RawChannelRoleRoleResponse {
    role_id: number;
    allow: number;
    deny: number;
}

export interface RawChannelRoleUserResponse {
    user_id: number;
    allow: number;
    deny: number;
}
