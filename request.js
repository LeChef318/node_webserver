'use strict'
import { BadRequestError } from "./badRequestError.js";

class Request {
    constructor() {
        this.method = null
        this.path = null
        this.protocolVersion = null
        this.headers = {}
        this.body = null
    }

    static createFrom(data) {
        const request = new Request()
        return request.parse(data)
    }

    parse(data) {
        const requestString = data.toString()
        const [head, ...body] = requestString.split('\r\n\r\n')
        this.body = body.join('\r\n\r\n')
        const [requestLine, ...headers] = head.split('\r\n')
        const [method, path, protocolVersion] = requestLine.split(' ')
        if (!method || !path || !protocolVersion) throw new BadRequestError('Request parsing error: Invalid request line')
        this.method = method
        this.path = path
        this.protocolVersion = protocolVersion
        headers.forEach(line => {
            const [name, value] = line.split(': ')
            if (!name || !value) {
                throw new BadRequestError('Request parsing error: Invalid header format')
            }
            this.headers[name] = value
        })
        return this
    }

    getMethod() {
        return this.method
    }

    getPath() {
        return this.path
    }

    getProtocolVersion() {
        return this.protocolVersion
    }

    getHeaders() {
        return this.headers
    }

    getHeader(name) {
        if (name in this.headers) {
            return this.headers[name]
        } else {
            throw new Error(`Key '${name}' not found`)
        }
    }

    getBody() {
        return this.body
    }
}

export { Request }
