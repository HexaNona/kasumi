/**
 * Adapted from https://github.com/shugen002/BotRoot/blob/master/src/MessageSource/MessageSource.ts
 * Copyright (c) 2021 shugen002 and contributors
 * Released under the MIT License
 */

import Logger from 'bunyan'
import { EventEmitter } from 'events'
import { cloneDeep } from 'lodash'
import Kasumi from '../client'
import { KHEventPacket } from './types/kaiheila/packet'

export interface MessageSource extends EventEmitter {
    type: string

    on(event: 'message', listener: (eventRequest: unknown) => void): this

    connect(): Promise<boolean>
}

export class MessageSource extends EventEmitter implements MessageSource {
    logger: Logger;
    protected botInstance: Kasumi;
    constructor(botInstance: Kasumi) {
        super()
        this.botInstance = botInstance;
        this.logger = this.botInstance.getLogger('websocket', 'botroot');
    }
    async connect(): Promise<boolean> {
        return false
    }
    protected buffer: KHEventPacket[] = []
    protected sn = 0
    protected onEventArrive(packet: KHEventPacket): void {
        if (this.botInstance.DISABLE_SN_ORDER_CHECK) { // Disable SN order check per config
            this.sn = packet.sn;
            return this.botInstance.message.recievedMessage(packet as any);
        }
        if ((packet as KHEventPacket).sn === this.sn + 1) {
            this.sn += 1
            if (this.sn >= 65535) this.sn = 0; // Reset sn after 65535 !important
            this.emit('message', cloneDeep(packet.d))
            this.eventProcess(packet)
            this.buffer.sort((a, b) => a.sn - b.sn)
            while (this.buffer.length > 0 && this.buffer[0].sn < this.sn + 1) {
                this.buffer.shift()
            }
            while (this.buffer.length > 0 && this.buffer[0].sn === this.sn + 1) {
                const packet = this.buffer.shift() as KHEventPacket<any>
                this.emit('message', cloneDeep(packet.d))
                this.eventProcess((packet as unknown) as KHEventPacket)
                while (this.buffer.length > 0 && this.buffer[0].sn < this.sn + 1) {
                    this.buffer.shift()
                }
            }
        } else if ((packet as KHEventPacket).sn > this.sn + 1) {
            this.buffer.push(packet as KHEventPacket)
        }
    }

    protected eventProcess(packet: KHEventPacket): void {
        if (packet.s == 0) {
            const event = packet.d;
            this.logger.trace(`Recieved message "${event.content}" from ${event.author_id}, ID = ${event.msg_id}`, {
                cur_sn: this.sn,
                msg_sn: packet.sn
            });
            this.botInstance.message.recievedMessage(packet as any);
        }
    }
}