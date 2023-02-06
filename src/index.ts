import Logger from "bunyan";

import API from "./api";
import Message from "./message";
import WS from "./websocket";


export default class Kasumi {
    rest: API;
    message: Message = new Message(this);
    websocket?: WS;
    logger: Logger;
    __bunyan_log_level: Logger.LogLevel;
    __bunyan_error_level: Logger.LogLevel;
    constructor(token: string) {
        switch (process.env.LOG_LEVEL?.toLowerCase()) {
            case 'verbose':
            case 'more':
            case 'trace':
                this.__bunyan_log_level = Logger.TRACE;
                break;
            case 'debug':
                this.__bunyan_log_level = Logger.DEBUG;
                break;
            case 'less':
            case 'warn':
                this.__bunyan_log_level = Logger.WARN;
                break;
            default:
                this.__bunyan_log_level = Logger.INFO;
        }
        switch (process.env.ERROR_LEVEL?.toLowerCase()) {
            case 'verbose':
            case 'more':
            case 'info':
                this.__bunyan_error_level = Logger.INFO;
                break;
            case 'less':
            case 'error':
                this.__bunyan_error_level = Logger.ERROR;
                break;
            default:
                this.__bunyan_error_level = Logger.WARN;
        }
        this.logger = new Logger({
            name: 'kasumi',
            streams: [{
                stream: process.stdout,
                level: this.__bunyan_log_level
            }, {
                stream: process.stderr,
                level: this.__bunyan_error_level
            }]
        });
        this.rest = new API(token);
        this.websocket = new WS(this);
    }
    on = this.message.on;
    emit = this.message.emit;
}