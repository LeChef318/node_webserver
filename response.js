'use strict'


const RESPONSE_MESSAGES = {
    200: 'OK',
    400: 'Bad Request',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    500: 'Internal Server Error',
};

class Response {
    constructor(socket) {
        this.socket = socket
    }

    static createResponse(socket) {
        return new Response(socket)
    }

    sendResponse(statusCode, bodyContent, contentType) {

        const statusMessage = RESPONSE_MESSAGES[statusCode];
        const responseMessage = statusMessage || '';
        const responseLine = `HTTP/1.1 ${statusCode} ${responseMessage}`;
        const body = bodyContent || `<h1>${responseMessage}</h1>`;

        const headers = {
            'Content-Length': Buffer.byteLength(body, 'utf-8'),
            'Content-Type': contentType || 'text/html',
        };

        this.socket.write(Buffer.from(`${responseLine}\r\n`))

        for (const [headerName, headerValue] of Object.entries(headers)) {
            this.socket.write(Buffer.from(`${headerName}: ${headerValue}\r\n`))
        }
        this.socket.write(Buffer.from('\r\n'))
        this.socket.write(Buffer.from(body, 'utf-8'))
    }
}

export { Response }
