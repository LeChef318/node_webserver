"use strict"

class MethodNotAllowedError extends Error {
    constructor(message) {
        super(message);
        this.name = "MethodNotAllowedError";
    }
}

export { MethodNotAllowedError }