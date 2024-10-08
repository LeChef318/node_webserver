'use strict'
import { createServer } from 'net'
import { Request } from './request.js'
import { ResourceHandler } from './ResourceHandler.js'
import { Response } from './response.js'
import { MethodNotAllowedError } from "./methodNotAllowedError.js";
import { ForbiddenError } from "./forbiddenError.js";
import { ResourceNotFoundError } from "./resourceNotFoundError.js";
import { BadRequestError } from "./badRequestError.js";

const allowed_methods = ['GET']

function newConnection(socket) {
    socket.on('end', function () {
        console.log('EOF')
    })
    socket.on('data', function (data) {
        handleRequest(socket, data)
    })
}

async function handleRequest(socket, data) {
    try {
        const request = Request.createFrom(data)
        if (!allowed_methods.includes(request.getMethod())) {
            throw new MethodNotAllowedError('Method not allowed')
        }

        const handler = await ResourceHandler.createFrom(request.getPath());
        const response = Response.createResponse(socket);
        const contentType = handler.getContentType();
        const body = await handler.getContent();
        response.sendResponse(200, body, contentType);
    } catch (e) {
        const response = Response.createResponse(socket);
        let statusCode = 500;

        if (e instanceof BadRequestError) {
            statusCode = 400;
        } else if (e instanceof ForbiddenError) {
            statusCode = 403;
        } else if (e instanceof ResourceNotFoundError) {
            statusCode = 404;
        } else if (e instanceof MethodNotAllowedError) {
            statusCode = 405;
        }

        response.sendResponse(statusCode);
        console.info(e);
    } finally {
        socket.end();
    }
}

const server = createServer();
server.on('connection', newConnection);
server.listen({
    host: '127.0.0.1',
    port: 4242
});
