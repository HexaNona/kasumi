export class RestError extends Error {
    constructor(
        code: number,
        message: string,
        method: string,
        endpoint: string
    ) {
        super(`${code} ${method} ${endpoint} ${message}`);
    }
}

export class TimeoutError extends Error {
    constructor(time: number) {
        super(`Operation timed out after ${time}ms`);
    }
}

export class NonceDismatchError extends Error {
    constructor() {
        super("Response nonce does not match request nonce");
    }
}

export class CommandNameNotPresentErorr extends Error {
    constructor() {
        super("Name is required in commands and menus");
    }
}

export class MethodNotImplementedError extends Error {
    constructor() {
        super("Method not implemented");
    }
}

export class MethodNotAllowedError extends Error {
    constructor(detail: string = "no detail given") {
        super(`This method is not allowed: ${detail}`);
    }
}

export class UnknownInputTypeError extends Error {
    constructor(received: string, required: string) {
        super(`Input requires "${required}", received "${received}" instead`);
    }
}

class InitializationError extends Error {
    constructor(message: string) {
        super(`Failed to initialize a Kasumi instance: ${message}`);
    }
}

export class TokenNotProvidedError extends InitializationError {
    constructor() {
        super("Missing token");
    }
}

export class WebHookMissingConfigError extends InitializationError {
    constructor() {
        super("Required config entry(s) is missing for WebHook connection");
    }
}

export class UnknownConnectionType extends InitializationError {
    constructor(connection?: string) {
        if (connection)
            super(`Current connection mode (${connection}) is not supported`);
        else super("Missing connection mode");
    }
}
