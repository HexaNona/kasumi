/* eslint-disable camelcase */

export interface KHAPIResponse<KHRequestType> {
    code: number;
    message: string;
    data: KHRequestType;
}

export interface KHAPIMultiPage<KHItemType> {
    items: KHItemType[];
    meta: {
        page: number;
        page_total: number;
        page_size: number;
        total: number;
    };
    [key: string]: unknown;
}
