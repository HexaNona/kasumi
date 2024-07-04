import {
    Action,
    Actions,
    Effect,
    Effects,
    State,
    States,
    StateTransfer,
    TimeoutKey,
    TimeoutKeys,
} from "./types";
import { promisify } from "util";
import { inflate as inflateRaw } from "zlib";
export const inflate = promisify(inflateRaw);

export const backoffDelay = (
    factor: number,
    times: number,
    min: number,
    max: number
): number => {
    return Math.min(min * Math.pow(factor, Math.max(times - 1, 0)), max);
};

const clearTimeoutEffect = (key: TimeoutKey) => Effects.CLEAR_TIMEOUT({ key });

const clearAllTimeoutsEffects = TimeoutKeys.map(clearTimeoutEffect);

const scheduleConnect = (state: State) =>
    Effects.SCHEDULE_TIMEOUT({
        key: "connect",
        timeoutMillis: backoffDelay(2, state.retryCount, 1, 60) * 1000,
        onTimeout: Actions.PULL_GATEWAY(),
    });

const waitForHello = (state: State) =>
    Effects.SCHEDULE_TIMEOUT({
        key: "hello",
        timeoutMillis: state.helloTimeoutMillis,
        onTimeout: Actions.HELLO_TIMEOUT(),
    });

const schedulePing = (state: State) =>
    Effects.SCHEDULE_TIMEOUT({
        key: "ping",
        timeoutMillis: state.heartbeatIntervalMillis,
        onTimeout: Actions.PING_TIMEOUT(),
    });

const waitForPong = (state: State) =>
    Effects.SCHEDULE_TIMEOUT({
        key: "pong",
        timeoutMillis: state.heartbeatTimeoutMillis,
        onTimeout: Actions.PONG_TIMEOUT(),
    });

const pullGateway: StateTransfer = (state) => [
    States.PULLING_GATEWAY(state),
    [Effects.PULL_GATEWAY({ compress: state.compress })],
];

export function transform(action: Action, state: State): [State, Effect[]] {
    return States.match(state, {
        INITIAL: () =>
            Actions.match(action, {
                PULL_GATEWAY: () => pullGateway(state),
                default: () => [state, []],
            }),
        PULLING_GATEWAY: () =>
            Actions.match(action, {
                CONNECT_GATEWAY: () => [
                    States.CONNECTING({ ...state, retryCount: 0 }),
                    [
                        Effects.CONNECT_WS({
                            compress: state.compress,
                            onOpen: Actions.OPEN(),
                            onClose: Actions.CLOSE(),
                            onPongMessage: Actions.HEARTBEAT(),
                        }),
                        waitForHello(state),
                    ],
                ],
                CLOSE: () => [state, [...clearAllTimeoutsEffects]],
                default: () => [state, []],
            }),
        CONNECTING: () =>
            Actions.match(action, {
                HELLO_TIMEOUT: () => [
                    state,
                    [
                        Effects.TRIGGER_ACTION({ action: Actions.CLOSE() }),
                        Effects.TRIGGER_ACTION({ action: Actions.RECONNECT() }),
                    ],
                ],
                OPEN: () => [
                    States.OPEN({ ...state, retryCount: 0 }),
                    [clearTimeoutEffect("hello"), schedulePing(state)],
                ],
                default: () => [state, []],
            }),
        OPEN: () =>
            Actions.match(action, {
                PING_TIMEOUT: () => [
                    state,
                    [
                        clearTimeoutEffect("ping"),
                        Effects.SEND_PING(),
                        waitForPong(state),
                    ],
                ],
                PONG_TIMEOUT: () => [
                    state,
                    [
                        Effects.TRIGGER_ACTION({ action: Actions.CLOSE() }),
                        Effects.TRIGGER_ACTION({ action: Actions.RECONNECT() }),
                    ],
                ],
                HEARTBEAT: () => [
                    state,
                    [
                        clearTimeoutEffect("ping"),
                        clearTimeoutEffect("pong"),
                        schedulePing(state),
                    ],
                ],
                CLOSE: () => [
                    States.CLOSED(state),
                    [
                        ...clearAllTimeoutsEffects,
                        Effects.TRIGGER_ACTION({ action: Actions.RECONNECT() }),
                    ],
                ],
                default: () => [state, []],
            }),
        CLOSED: () =>
            Actions.match(action, {
                RECONNECT: () => [
                    States.RECONNECTING({
                        ...state,
                        retryCount: state.retryCount + 1,
                    }),
                    [scheduleConnect(state)],
                ],
                default: () => [state, []],
            }),
        RECONNECTING: () =>
            Actions.match(action, {
                PULL_GATEWAY: () => pullGateway(state),
                default: () => [state, []],
            }),
    });
}
