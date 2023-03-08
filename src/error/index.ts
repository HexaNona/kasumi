export class RestError extends Error {
    code: number;
    constructor(code: number, message: string, method: string, endpoint: string) {
        super(`${method} ${endpoint} ${message}`);
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

export class MethodNotImplementedError extends Error {
    constructor() {
        super("Method not implemented");
    }
}

export class UnknowInputTypeError extends Error {
    constructor(received: string, required: string) {
        super(`Input requires "${required}", received "${received}" instead`);
    }
}