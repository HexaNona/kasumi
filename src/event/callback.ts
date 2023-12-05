import Kasumi from '@ksm/client';
import { RawEmisions } from './type';

type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (...a: Parameters<T>) => TNewReturn;

export interface PresistentSession {
    messageId: string;
    activator: string;
    args: any[];
}
export default class Callback {

    private client: Kasumi<any>;

    constructor(client: Kasumi<any>) {
        this.client = client;
    }

    createCallback<T extends keyof RawEmisions>(eventName: T, filter: ReplaceReturnType<RawEmisions[T], boolean>, callback: RawEmisions[T]) {
        this.client.on(eventName, (event: any) => {
            // @ts-ignore
            if (filter(event)) {
                callback(event);
            }
        });
    }
    createSingleCallback<T extends keyof RawEmisions>(eventName: T, filter: ReplaceReturnType<RawEmisions[T], boolean>, callback: RawEmisions[T]) {
        const cb = (event: any) => {
            // @ts-ignore
            if (filter(event)) {
                this.client.removeListener(eventName, cb);
                // @ts-ignore
                callback(event);
            }
        }
        this.client.on(eventName, cb);
    }
    async createAsyncCallback<T extends keyof RawEmisions, K extends any>(eventName: T, filter: ReplaceReturnType<RawEmisions[T], boolean>, callback: ReplaceReturnType<RawEmisions[T], K>, timeout = 30 * 1000): Promise<K> {
        return new Promise((resolve, reject) => {
            const cb = (event: any) => {
                // @ts-ignore
                if (filter(event)) {
                    this.client.removeListener(eventName, cb);
                    clearTimeout(timer);
                    // @ts-ignore
                    resolve(callback(event));
                }
            }
            this.client.on(eventName, cb);
            const timer = setTimeout(() => {
                reject(new Error('Event timed out'));
            }, timeout);
        });

    }
}