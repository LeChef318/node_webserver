'use strict'
import { readdir, readFile } from 'fs/promises'
import {
    normalize, resolve, join, extname, parse, dirname, basename
} from 'path'
import { ResourceNotFoundError } from "./resourceNotFoundError.js";
import { ForbiddenError } from "./forbiddenError.js";

class ResourceHandler {
    constructor(path) {
        this.rootDir = resolve(path)
        this.normalizedPath = null
    }

    static async createFrom(resourcePath, rootPath = './resources') {
        const handler = new ResourceHandler(rootPath)
        await handler.resolvePath(resourcePath)
        return handler
    }

    async resolvePath(resourcePath) {
        const filePath = resourcePath === '/' ? 'index.html' : resourcePath
        const files = await readdir(normalize(join(this.rootDir, dirname(filePath))))
        for (const file of files) {
            if (!extname(filePath)) {
                if (parse(file).name === parse(filePath).name) {
                    const filename = basename(file)
                    this.normalizedPath = normalize(join(this.rootDir, dirname(filePath), filename))
                    break
                }
            } else {
                if (basename(file) === basename(filePath)) {
                    this.normalizedPath = normalize(join(this.rootDir, filePath))
                    break
                }
            }
        }
        if (!this.normalizedPath) {
            throw new ResourceNotFoundError('File not found')
        }
        if (!this.normalizedPath.startsWith(this.rootDir)) {
            throw new ForbiddenError('Access denied')
        }
    }

    getContentType() {
        const ext = extname(this.normalizedPath).toLowerCase()
        const contentTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif'
        }
        return contentTypes[ext] || 'application/octet-stream'
    }

    async getContent() {
        return await readFile(this.normalizedPath)
    }
}

export { ResourceHandler }
