export interface KaiheilaEncryptPacket {
    encrypt: string;
}

export type KaiheilaWebhookRequest = KaiheilaEncryptPacket | KHPacket;
export enum KHOpcode {
    EVENT = 0,
    HELLO = 1,
    PING = 2,
    PONG = 3,
    RECONNECT = 5,
    RESUME_ACK = 6,
}

export interface KHPacket {
    s: KHOpcode;
    d: any;
    sn?: number;
}

interface KHWebhookChallenge {
    verify_token: string;
    type: 255;
    channel_type: "WEBHOOK_CHALLENGE";
    challenge: string;
    msg_id: undefined;
}

export interface KHMessageEventBase {
    channel_type: "GROUP";
    type: number;
    target_id: string;
    author_id: string;
    content: string;
    msg_id: string;
    msg_timestamp: number;
    nonce: string;
    verify_token?: string;
    extra: any;

    [key: string]: any;
}

/**
 * 信令[1] HELLO
 *
 * **方向：** server->client
 *
 * **说明：** 当我们成功连接websocket后，客户端应该在6s内收到该包，否则认为连接超时。
 *
 * | 状态码 | 含义 | 备注 |
 * | - | - | - |
 * | 0 | 成功 |
 * | 40100 | 缺少参数 | |
 * | 40101 | 无效的token | |
 * | 40102 | token验证失败 | |
 * | 40103 | token过期 | 需要重新连接 |
 */
export interface KHHelloPacket {
    s: KHOpcode;
    d: {
        code: 0 | 40100 | 40101 | 40102 | 40103;
        session_id?: string;
    };
}

/**
 * 信令[0] EVENT
 *
 * **方向：** server->client
 *
 * **说明：** 在正常连接状态下，收到的消息事件等。
 *
 * **参数列表：**
 *
 * 具体参见[Event](https://developer.kaiheila.cn/doc/event)
 *
 * **注意：** 该消息会有 `sn`, 代表消息序号, 针对当前 `session` 的消息的序号, 客户端需记录该数字,并按顺序接收消息， **resume** 时需传入该参数才能完成
 *
 * **注意事项：**
 *
 * 1. 收到消息时需要按照 `sn`  顺序处理, 服务端会尽可能保证 `sn` 的顺序性
 * 2. 假设收到消息的 `sn` 出现乱序, 需要先存入暂存区 (`buffer`) 等待正确的 `sn` 消息处理后再从暂存区顺序处理
 * 3. 假设收到了一条已处理过的 `sn` 的消息, 则直接抛弃不处理
 * 4. 客户端需要存储当前已处理成功的最大的 `sn`, 待心跳ping时回传服务端, 如果服务端发现当前客户端最新处理成功的消息 `sn` 落后于最新消息 (丢包等异常情况), 服务端将会按照客户端指定的 `sn` 将之后所有最新的消息重传给客户端.
 * 5. 消息内容与webhook保持一致
 */
export interface KHEventPacket<T = any> {
    s: KHOpcode;
    d: T;
    sn: number;
}

/**
 * 信令[2] PING
 *
 * **方向：** client -> server
 *
 * **说明：** 每隔30s(随机-5，+5),将当前的最大 `sn` 传给服务端,客户端应该在6s内收到PONG, 否则心跳超时。
 *
 * **参数列表：**
 *
 * | 参数 | 描述                              | 类型 | 必传 |
 * | ---- | --------------------------------- | ---- | ---- |
 * | sn   | 客户端目前收到的最新的消息 **sn** | number | Y    |
 */
export interface KHPingPacket {
    s: KHOpcode;
    /**
     * | 参数 | 描述                              | 类型 | 必传 |
     * | ---- | --------------------------------- | ---- | ---- |
     * | sn   | 客户端目前收到的最新的消息 **sn** | number | Y    |
     */
    sn: number;
}

/**
 * 信令[3] PONG
 *
 * **方向：**  server -> client
 *
 * **说明：** 回应客户端发出的ping
 */
export interface KHPongPacket {
    s: KHOpcode;
}

/**
 * 信令[5] RECONNECT
 * **方向：** server->client
 *
 * **说明：** 服务端通知客户端, 代表该连接已失效, 请重新连接。客户端收到后应该主动断开当前连接。
 *
 * **注意：**  客户端收到该信令代表因为某些原因导致当前连接已失效, 需要进行以下操作以避免消息丢失.
 * 1. 重新获取 gateway;
 * 2. 清空本地的 sn 计数;
 * 3. 清空本地消息队列.
 *
 * | 状态码 | 描述                                    |
 * | ------------ | --------------------------------------- |
 * | 40106        | resume 失败, 缺少参数                   |
 * | 40107        | 当前 `session` 已过期 (resume 失败, PING的sn无效)      |
 * | 40108        | 无效的 `sn` ,  或 `sn` 已经不存在 (resume 失败, PING的 `sn` 无效) |
 */
export interface KHReconnectPacket {
    s: KHOpcode;
    d: {
        /**
         * | 状态码 | 描述                                    |
         * | ------------ | --------------------------------------- |
         * | 40106        | resume 失败, 缺少参数                   |
         * | 40107        | 当前 `session` 已过期 (resume 失败, PING的sn无效)      |
         * | 40108        | 无效的 `sn` ,  或 `sn` 已经不存在 (resume 失败, PING的 `sn` 无效) |
         */
        code: 40106 | 40107 | 40108;
    };
}
