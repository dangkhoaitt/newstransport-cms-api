import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { CHANGE_PASSWORD } from 'src/auth/auth.constant'
import { AuthHelper } from 'src/auth/helper/auth.helper'
import { AuthUser } from 'src/auth/interfaces/auth-user.interface'

@Injectable()
export class JwtRolesAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super()
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Request is using Public decorator
        const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler())
        if (isPublic) {
            return true
        }

        // Check authenticated request
        if (await super.canActivate(context)) {
            const roles = this.reflector.getAllAndMerge<string[]>('roles', [context.getHandler(), context.getClass()])
            if (roles.length === 0) {
                return true
            }

            const request: Request = context.switchToHttp().getRequest()
            const user = request.user as AuthUser
            if (request.path.includes(CHANGE_PASSWORD)) {
                AuthHelper.setCurrentAuth(request.body.oldPassword, user.userId)
            }

            if (user && roles.includes(user.role)) {
                return true
            }
        }
        return false
    }
}
