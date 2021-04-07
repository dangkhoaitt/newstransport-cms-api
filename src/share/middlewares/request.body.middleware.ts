import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

const methods = ['post', 'patch']
@Injectable()
export class RequestBodyMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void {
        const method = req.method.toLowerCase()
        const isBodyEmpty = Object.keys(req.body).length === 0

        if (methods.includes(method) && isBodyEmpty) {
            throw new BadRequestException('Request body cannot be empty for method POST and PATCH')
        }
        next()
    }
}
