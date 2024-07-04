import { BaseClient } from "..";
// import { parsePacket } from './packet-parser';
import { KEventPacket } from "./types";

abstract class BaseReceiver {
    client: BaseClient;
    sn: number = 0;
    buffer: KEventPacket[] = [];
    constructor(client: BaseClient) {
        this.client = client;
    }
    abstract connect(): Promise<void>;

    protected onEventArrive(packet: KEventPacket): void {
        if (this.client.kasumi.DISABLE_SN_ORDER_CHECK) {
            // Disable SN order check per config
            this.sn = packet.sn;
            return this.client.kasumi.message.recievedMessage(packet as any);
        }
        if (packet.sn === this.sn + 1) {
            this.sn += 1;
            if (this.sn >= 65535) this.sn = 0;
            // this.emit('message', cloneDeep(packet.d));
            this.eventProcess(packet);
            this.buffer.sort((a, b) => a.sn - b.sn);
            while (this.buffer.length > 0 && this.buffer[0].sn < this.sn + 1) {
                this.buffer.shift();
            }
            while (
                this.buffer.length > 0 &&
                this.buffer[0].sn === this.sn + 1
            ) {
                const packet = this.buffer.shift() as KEventPacket;
                // this.emit('message', cloneDeep(packet.d));
                this.eventProcess(packet);
                while (
                    this.buffer.length > 0 &&
                    this.buffer[0].sn < this.sn + 1
                ) {
                    this.buffer.shift();
                }
            }
        } else if (packet.sn > this.sn + 1) {
            this.buffer.push(packet);
        }
    }

    protected eventProcess(packet: KEventPacket): void {
        // this.client.emit('raw', packet.d);
        // const result = parsePacket(packet.d, this.client);
        const event = packet.d;
        this.client.logger.trace(
            `Recieved message "${event.content}" from ${event.author_id}, ID = ${event.msg_id}`,
            {
                cur_sn: this.sn,
                msg_sn: packet.sn,
            }
        );
        this.client.kasumi.message.recievedMessage(packet as any);
        // this.client.emit(result.type, result);
    }
}

export { BaseReceiver };
