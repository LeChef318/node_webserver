'use strict'
import { BadRequestError } from "./badRequestError.js";
//class for parsing and holding an HTTP request
class Request {
    constructor() {
        this.method = null
        this.path = null
        this.protocolVersion = null
        this.headers = {}
        this.body = null
    }
    //static factory method for creating request objects
    //the parameter "data" is the raw HTTP request buffer and is parsed after object creation
    //returns a request object
    static createFrom(data) {
        const request = new Request()
        return request.parse(data)
    }

    //method to parse HTTP request
    //called by the factory method after object creation
    //returns the request object, throws a BadRequestError if the request could not be parsed
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

    //returns the request method
    getMethod() {
        return this.method
    }

    //returns the request path
    getPath() {
        return this.path
    }

    //returns the HTTP protocol version
    getProtocolVersion() {
        return this.protocolVersion
    }

    //returns an object with all request headers
    getHeaders() {
        return this.headers
    }

    //returns the value of a specific header
    //throws an error if the header is not present
    getHeader(name) {
        if (name in this.headers) {
            return this.headers[name]
        } else {
            throw new Error(`Key '${name}' not found`)
        }
    }

    //returns the request body
    getBody() {
        return this.body
    }
}

export { Request }
