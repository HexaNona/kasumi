import { Config } from "@ksm/config";
import Kasumi from "@ksm/client";
import crypto from "crypto";
import { ButtonClickedEvent } from "@ksm/message/type";

interface sessionDetail {
    activator: string;
    once: boolean;
    data: any;
}

export default class Button {
    private activatorFunctions: Map<string, Function> = new Map();

    private client: Kasumi<any>;

    constructor(client: Kasumi<any>) {
        this.client = client;

        this.client.on("event.button", async (event: ButtonClickedEvent) => {
            this.runSession(event);
        });
    }

    getActivator(activator: string) {
        return this.activatorFunctions.get(activator);
    }
    removeActivator(activator: string) {
        this.activatorFunctions.delete(activator);
    }
    registerActivator(
        activator: string,
        cb: (event: ButtonClickedEvent, data: any) => void | Promise<void>
    ) {
        this.activatorFunctions.set(activator, cb);
    }

    createSession(activator: string, data: any, once = false) {
        const sessionId = crypto.randomUUID();
        this.client.config.set(
            Config.join("kasumi", "events", "button", sessionId),
            {
                activator,
                once,
                data,
            }
        );
        return sessionId;
    }

    async runSession(event: ButtonClickedEvent) {
        try {
            const data = JSON.parse(event.value);
            if (data.sessionId) {
                const { sessionId } = data;
                const sessionDetail = (await this.client.config.getOne(
                    Config.join("kasumi", "events", "button", sessionId)
                )) as sessionDetail | undefined;
                if (sessionDetail) {
                    const cb = this.getActivator(sessionDetail.activator);
                    if (cb) {
                        await cb(event, sessionDetail.data);
                        if (sessionDetail.once) {
                            this.client.config.delete(
                                Config.join(
                                    "kasumi",
                                    "events",
                                    "button",
                                    sessionId
                                )
                            );
                        }
                        return true;
                    } else return false;
                }
                return false;
            } else return false;
        } catch (e) {
            this.client.logger.warn(e);
            return false;
        }
    }
}
