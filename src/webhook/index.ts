import Logger from 'bunyan';
import Kasumi from '../';
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import { WebHookSafeConfig, WebHook as WebHookType } from './type';
import { WebHookMissingConfigError } from '../error';

export default class WebHook {
    public logger: Logger;
    private isInitialization = true;
    private client: Kasumi;
    private http: Express;
    private sn: number = 0;
    private port!: number;
    private messageBuffer: Array<Exclude<WebHookType.Events, WebHookType.ChallengeEvent>> = [];
    private config: WebHookSafeConfig;
    constructor(client: Kasumi) {
        this.client = client;
        if (!this.client.config.isWebHookSafe()) throw new WebHookMissingConfigError();
        this.config = this.client.config as WebHookSafeConfig;
        this.logger = this.client.getLogger('webhook');
        this.http = express();
        this.http.use(bodyParser.json());
        this.http.post('/', async (req, res) => {
            const body: { encrypt: string } = req.body;
            if (body.encrypt) {
                try {
                    const base64Content = body.encrypt;
                    const base64Decode = Buffer.from(base64Content, 'base64').toString('utf8');
                    const iv = base64Decode.substring(0, 16);
                    const encrypt = base64Decode.substring(16);

                    const encryptKey = (await this.config.getOne('kasumi::config.webhookEncryptKey')).padEnd(32, '\0');
                    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptKey, iv);
                    const decrypt = decipher.update(encrypt, 'base64', 'utf8') + decipher.final('utf8');
                    const event: WebHookType.Events = JSON.parse(decrypt);
                    if (event.d.verify_token == (await this.config.getOne('kasumi::config.webhookVerifyToken'))) {
                        if (this.__isChallengeEvent(event)) {
                            res.send({
                                challenge: event.d.challenge
                            }).end();
                        } else {
                            res.end();
                            this.logger.trace(`Recieved message "${event.d.content}" from ${event.d.author_id}, ID = ${event.d.msg_id}`, {
                                cur_sn: this.sn,
                                msg_sn: event.sn
                            });
                            if (this.isInitialization) {
                                this.sn = event.sn;
                                this.isInitialization = false;
                            }
                            if (this.client.DISABLE_SN_ORDER_CHECK) { // Disable SN order check per config
                                this.sn = event.sn;
                                return this.client.message.recievedMessage(event);
                            }
                            this.messageBuffer.push(event);
                            this.messageBuffer.sort((a, b) => { return a.sn - b.sn });
                            while (this.messageBuffer[0] && this.messageBuffer[0].sn <= this.sn) this.messageBuffer.shift();
                            while (this.messageBuffer[0] && this.sn + 1 == this.messageBuffer[0].sn) {
                                let buffer = this.messageBuffer.shift();
                                if (buffer) {
                                    this.client.message.recievedMessage(buffer);
                                    this.sn = buffer.sn;
                                    if (this.sn >= 65535) this.sn = 0;
                                }
                                while (this.messageBuffer[0] && this.messageBuffer[0].sn < this.sn) this.messageBuffer.shift();
                            }
                            this.logger.trace(`${this.messageBuffer.length} more message(s) in buffer`);
                        }
                    } else {
                        this.logger.warn('Verify token dismatch!');
                        this.logger.warn(event);
                        res.status(401).end();
                    }
                } catch (e) {
                    res.status(500).end();
                    this.logger.error(e);
                }
            } else {
                this.logger.warn('Recieved unencrypted request')
                res.status(401).end();
            }
        })
        this.http.get('/', (req, res) => {
            res.send({
                user: this.client.me,
                message: {
                    latestSn: this.sn,
                    bufferSize: this.messageBuffer.length
                }
            })
        })
        import('get-port').then(({ default: getPort }) => {
            this.config.getOne("kasumi::config.webhookPort").then((webhookPort) => {
                getPort({ port: webhookPort }).then(port => {
                    this.port = port;
                    this.http.listen(this.port, () => {
                        this.logger.info(`Kasumi starts listening on port ${this.port}`);
                        this.client.emit('connect.webhook', {
                            type: 'webhook',
                            vendor: 'hexona',
                            bot: this.client.me
                        })
                    });
                })
            })
        })
    }

    private __isChallengeEvent(event: WebHookType.Events): event is WebHookType.ChallengeEvent {
        return event.d.channel_type == 'WEBHOOK_CHALLENGE'
    }
}