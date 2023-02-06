import axios, { Axios, AxiosInstance } from "axios";
import { RawResponse } from "../type";
import { RestError } from "../error";

export default class Rest {
    protected __requestor: AxiosInstance;
    constructor(provide: string | AxiosInstance) {
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
    }
    protected async get(endpoint: string, params?: any): Promise<any> {
        const data: RawResponse = (await this.__requestor.get(endpoint, {
            params
        })).data;
        if (data.code == 0) return data.data;
        else throw new RestError(data.code, data.message);
    }
    protected async post(endpoint: string, body?: any): Promise<any> {
        const data: RawResponse = (await this.__requestor.post(endpoint, body)).data;
        if (data.code == 0) return data.data;
        else throw new RestError(data.code, data.message);
    }
    protected async put(endpoint: string, body?: any): Promise<any> {
        const data: RawResponse = (await this.__requestor.put(endpoint, body)).data;
        if (data.code == 0) return data.data;
        else throw new RestError(data.code, data.message);
    }
}