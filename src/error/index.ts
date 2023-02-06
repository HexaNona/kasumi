export class RestError extends Error {
    code: number;
    constructor(code: number, message: string) {
        super(message);
        this.code = code;
    }
}

export class TimeoutError extends Error {
    constructor(time: number) {
        super(`Operation timed out after ${time}ms`);
    }
}

export class NonceDismatchError extends Error {
    constructor() {
        super("Response nonce does not match request nonce")
    }
}