import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { MultiPageResponse, RawResponse, RequestResponse } from "@ksm/type";
import { RestError } from "@ksm/error";
import Logger from "bunyan";

export default class Rest {
    readonly TRACE_MAX_CHARACTERS = 250;

    private isVerbose() {
        return (
            process.env.LOG_LEVEL &&
            ["verbose", "more", "trace"].includes(
                process.env.LOG_LEVEL.toLowerCase()
            )
        );
    }

    private isDebug() {
        return (
            process.env.LOG_LEVEL &&
            ["debug"].includes(process.env.LOG_LEVEL.toLowerCase())
        );
    }

    axios: AxiosInstance;
    logger: Logger;
    constructor(
        provide: string | AxiosInstance,
        logger: Logger,
        customEndpoint = "https://www.kookapp.cn/api/v3"
    ) {
        if (typeof provide == "string") {
            this.axios = axios.create({
                baseURL: customEndpoint,
                headers: {
                    Authorization: `Bot ${provide}`,
                },
            });
        } else {
            this.axios = provide;
        }
        this.logger = logger;
    }
    async get<T = any>(
        endpoint: string,
        params?: any,
        config?: AxiosRequestConfig
    ): Promise<RequestResponse<T>> {
        let data: RawResponse, err: Error;
        try {
            if (this.isVerbose()) {
                const stringBody = JSON.stringify(params) || "";
                this.logger.trace(
                    `GET ${endpoint} ${stringBody.length > this.TRACE_MAX_CHARACTERS ? `${stringBody.substring(0, this.TRACE_MAX_CHARACTERS)}...` : stringBody}`
                );
            }
            data = (await this.axios.get(endpoint, { params, ...config }))
                .data as RawResponse;
            if (data.code == 0) return { data: data.data };
            else throw new RestError(data.code, data.message, "GET", endpoint);
        } catch (e) {
            if (axios.isAxiosError(e))
                if (e.response)
                    err = new RestError(
                        e.response.data.code,
                        e.response.data.message,
                        "POST",
                        endpoint
                    );
                else
                    err = new RestError(
                        parseInt(e.code || "-1"),
                        "",
                        "POST",
                        endpoint
                    );
            else err = e as any;
            if (this.isDebug() || this.isVerbose()) {
                this.logger.warn(err.message || err);
            }
            return { err };
        }
    }
    async post<T = any>(
        endpoint: string,
        body?: any,
        config?: AxiosRequestConfig
    ): Promise<RequestResponse<T>> {
        let data: RawResponse, err: Error;
        try {
            if (this.isVerbose()) {
                const stringBody = JSON.stringify(body) || "";
                this.logger.trace(
                    `POST ${endpoint} ${stringBody.length > this.TRACE_MAX_CHARACTERS ? `${stringBody.substring(0, this.TRACE_MAX_CHARACTERS)}...` : stringBody}`
                );
            }
            data = (await this.axios.post(endpoint, body, config))
                .data as RawResponse;
            if (data.code == 0) return { data: data.data };
            else throw new RestError(data.code, data.message, "POST", endpoint);
        } catch (e) {
            if (axios.isAxiosError(e))
                if (e.response)
                    err = new RestError(
                        e.response.data.code,
                        e.response.data.message,
                        "POST",
                        endpoint
                    );
                else
                    err = new RestError(
                        parseInt(e.code || "-1"),
                        "",
                        "POST",
                        endpoint
                    );
            else err = e as any;
            if (this.isDebug() || this.isVerbose()) {
                this.logger.warn(err.message || err);
            }
            return { err };
        }
    }
    async *multiPageRequest<T extends MultiPageResponse<any>>(
        endpoint: string,
        page?: number,
        pageSize?: number,
        params?: any
    ) {
        let res = (await this.get(endpoint, {
            page,
            page_size: pageSize,
            ...params,
        })) as RequestResponse<T>;
        let { err, data } = res;
        yield res;
        if (!data || err) return;
        for (
            let currentPage = data.meta.page + 1;
            currentPage <= data.meta.page_total;
            ++currentPage
        ) {
            res = await this.get(endpoint, {
                page: currentPage,
                page_size: pageSize,
            });
            yield res;
            let { err, data } = res;
            if (!data || err) return;
        }
    }
}
