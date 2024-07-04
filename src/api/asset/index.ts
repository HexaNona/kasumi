import Rest from "@ksm/requestor";
import { RawAssetCreateResponse } from "./type";
import FormData from "form-data";
import { RequestResponse } from "@ksm/type";

export default class Asset {
    private rest: Rest;
    constructor(rest: Rest) {
        this.rest = rest;
    }

    /**
     * Upload file to KOOK
     * @param buffer ArrayBuffer of the file
     * @param config Other FormData configs
     * @returns File URL
     */
    async create(
        buffer: Buffer,
        config?: FormData.AppendOptions
    ): Promise<RequestResponse<RawAssetCreateResponse>> {
        const form = new FormData();
        form.append("file", buffer, {
            filename: "image.png",
            ...config,
        });
        return this.rest.post("/asset/create", form, {
            headers: form.getHeaders(),
        });
    }
}
