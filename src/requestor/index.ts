import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { MultiPageResponse, RawResponse } from "../type";
import { RestError } from "../error";
import Logger from "bunyan";

export default class Rest {
    protected __this: AxiosInstance;
    logger: Logger;
    constructor(provide: string | AxiosInstance, logger: Logger) {
        if (typeof provide == 'string') {
            this.__this = axios.create({
                baseURL: 'https://www.kookapp.cn/api/v3',
                headers: {
                    Authorization: `Bot ${provide}`,
                }
            });
        } else {
            this.__this = provide;
        }
        this.logger = logger;
    }
    async get(endpoint: string, params?: any, config?: AxiosRequestConfig): Promise<any> {
        const data: RawResponse = (await this.__this.get(endpoint, { params, ...config })).data;
        if (data.code == 0) return data.data;
        else throw new RestError(data.code, data.message, 'GET', endpoint);
    }
    async post(endpoint: string, body?: any, config?: AxiosRequestConfig): Promise<any> {
        const data: RawResponse = (await this.__this.post(endpoint, body, config)).data;
        if (data.code == 0) return data.data;
        else throw new RestError(data.code, data.message, 'POST', endpoint);
    }
    async put(endpoint: string, body?: any, config?: AxiosRequestConfig): Promise<any> {
        const data: RawResponse = (await this.__this.put(endpoint, body, config)).data;
        if (data.code == 0) return data.data;
        else throw new RestError(data.code, data.message, 'PUT', endpoint);
    }
    async *multiPageRequest<T extends MultiPageResponse<any>>(endpoint: string, page: number, pageSize: number, params?: any) {
        let data = await (this.get(endpoint, {
            page, page_size: pageSize,
            ...params
        }) as Promise<T>).catch((e) => {
            this.logger.error(e);
            return undefined;
        });
        yield data;
        if (!data) return;
        for (let currentPage = page + 1; currentPage <= data.meta.page_total; ++currentPage) {
            data = await this.get(endpoint, { page: currentPage, page_size: pageSize }).catch((e) => {
                this.logger.error(e);
                return undefined;
            });
            if (!data) return;
        }
    }
}