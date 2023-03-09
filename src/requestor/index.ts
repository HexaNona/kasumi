import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { RawResponse } from "../type";
import { RestError } from "../error";
import Logger from "bunyan";

export default class Rest {
    protected __requestor: AxiosInstance;
    logger: Logger;
    constructor(provide: string | AxiosInstance, logger: Logger) {
        if (typeof provide == 'string') {
            this.__requestor = axios.create({
                baseURL: 'https://www.kookapp.cn/api/v3',
                headers: {
                    Authorization: `Bot ${provide}`,
                }
            });
        } else {
            this.__requestor = provide;
        }
        this.logger = logger;
    }
    async get(endpoint: string, params?: any, config?: AxiosRequestConfig): Promise<any> {
        const data: RawResponse = (await this.__requestor.get(endpoint, { params, ...config })).data;
        if (data.code == 0) return data.data;
        else throw new RestError(data.code, data.message, 'GET', endpoint);
    }
    async post(endpoint: string, body?: any, config?: AxiosRequestConfig): Promise<any> {
        const data: RawResponse = (await this.__requestor.post(endpoint, body, config)).data;
        if (data.code == 0) return data.data;
        else throw new RestError(data.code, data.message, 'POST', endpoint);
    }
    async put(endpoint: string, body?: any, config?: AxiosRequestConfig): Promise<any> {
        const data: RawResponse = (await this.__requestor.put(endpoint, body, config)).data;
        if (data.code == 0) return data.data;
        else throw new RestError(data.code, data.message, 'PUT', endpoint);
    }
}