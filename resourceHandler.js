'use strict'
import { readdir, readFile } from 'fs/promises'
import {
    normalize, resolve, join, extname, parse, dirname, basename
} from 'path'
import { ResourceNotFoundError } from "./resourceNotFoundError.js";
import { ForbiddenError } from "./forbiddenError.js";
//class to resolve the resource path and make sure no other directory is accessible
class ResourceHandler {
    constructor(path) {
        this.rootDir = resolve(path)
        this.normalizedPath = null
    }

    //factory method to create a new resource handler
    //first argument = requested resource, (optional) second argument = relative to the servers resource folder
    //calls resolvePath method after object creation
    //returns a resourceHandler object
    static async createFrom(resourcePath, rootPath = './resources') {
        const handler = new ResourceHandler(rootPath)
        await handler.resolvePath(resourcePath)
        return handler
    }

    //resolves the path to the requested resource
    //sets the resource to 'index.html' if '/' is requested
    //when extension is provided looks for file with extension, with no extension provided selects the first occurrence of the given name
    //normalizes and sets the absolute path of the resource on the object
    //throws a ResourceNotFoundError if file is not found, throws a ForbiddenError when trying to access files outside the resource directory
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

    //returns content type of the file
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

    //returns the file
    async getContent() {
        return await readFile(this.normalizedPath)
    }
}

export { ResourceHandler }
