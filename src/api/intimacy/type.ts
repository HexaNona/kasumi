export interface RawIntimacyIndexResponse {
    img_url: string;
    social_info: string;
    last_read: number;
    score: number;
    img_list: {
        id: string;
        url: string;
    }[];
}
