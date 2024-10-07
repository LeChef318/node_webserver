"use strict"

class ResourceNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "ResourceNotFoundError";
    }
}

export { ResourceNotFoundError }