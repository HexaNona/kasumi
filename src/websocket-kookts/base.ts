import { default as axios, AxiosInstance, AxiosResponse } from 'axios';
import { EventEmitter2 } from 'eventemitter2';
import { BaseReceiver } from './event-receiver/base';
import { WebsocketReceiver } from './event-receiver/websocket';
import Logger from 'bunyan';
import Kasumi from '../';

export class BaseClient extends EventEmitter2 {
    axios: AxiosInstance;
    receiver: BaseReceiver;
    kasumi: Kasumi;
    logger: Logger;

    constructor(client: Kasumi) {
        super({ wildcard: true });

        this.kasumi = client;
        this.logger = this.kasumi.getLogger('websocket', 'kookts');

        this.axios = axios.create({
            baseURL: 'https://www.kookapp.cn/api',
            headers: {
                Authorization: 'Bot ' + this.kasumi.__token,
            },
        });
        this.receiver = new WebsocketReceiver(this);
    }

    post(url: string, data: any): Promise<AxiosResponse<any>> {
        return this.axios.post(url, JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    get(url: string, params: any): Promise<AxiosResponse<any>> {
        return this.axios.get(url, {
            params: new URLSearchParams(params),
        });
    }

    /**
     * 链接消息源
     */
    connect(): void {
        this.receiver.connect();
    }
}
