import { Request } from 'express'
import { AuthUser } from 'src/auth/interfaces/auth-user.interface'

export class RequestHelper {
    private static request: Request

    public static setRequest(request: Request): void {
        this.request = request
    }

    public static getRequest(): Request {
        return this.request
    }

    public static getAuthUser(): AuthUser {
        return this.request.user as AuthUser
    }

    public static getOrigin(): string {
        return this.request.headers.origin
    }

    public static clear(): void {
        delete this.request
    }
}
