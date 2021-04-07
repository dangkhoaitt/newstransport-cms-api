import { Inject, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { Request } from 'express'
import * as jwt from 'jsonwebtoken'
import { Collection, FindOneAndDeleteOption, FindOneOptions, ObjectId } from 'mongodb'
import { CollectionList } from 'src/share/constants/collection.constant'
import { BaseInterface } from 'src/share/interfaces/base.interface'
import { BaseService } from 'src/share/service/base.service'
import { ADMIN } from 'src/user/user.constant'
import { User } from 'src/user/user.interface'
import { WinstonLogger } from 'src/winston/winston.classes'
import { InjectLogger } from 'src/winston/winston.decorators'
import { JWT_ACCESS_TOKEN_ID, JWT_REFRESH_TOKEN_ID } from './auth.constant'
import { AuthRequest } from './auth.validator'
import { AuthUser } from './interfaces/auth-user.interface'

type LoginResponse = { userId: string; role: string; accessToken: string; refreshToken?: string; expiresIn: number }

@Injectable()
export class AuthService extends BaseService<BaseInterface> {
    constructor(
        @Inject(CollectionList.USER_COLLECTION) private userCollection: Collection<User>,
        private jwtService: JwtService,
        @InjectLogger(CollectionList.USER_COLLECTION) private readonly authLogger: WinstonLogger
    ) {
        super(authLogger)
    }

    async login({ username, password, remember }: AuthRequest, req: Request, cms?: boolean): Promise<LoginResponse> {
        const user = await this.checkUser(username, password, cms)
        if (user) {
            const payload = this.getPayloadFromUser(user)
            return {
                userId: payload.userId,
                role: payload.role,
                accessToken: this.getAccessToken(payload),
                refreshToken: remember ? this.getRefreshToken(payload, this.getMetadataFromRequest(req)) : undefined,
                expiresIn: parseInt(process.env.JWT_EXPIRES_IN)
            }
        }
        return null
    }

    refreshToken(token: string, request: Request): string {
        const metadata = this.getMetadataFromRequest(request)
        try {
            const payload = this.validateToken(token, { jwtid: JWT_REFRESH_TOKEN_ID })

            if (payload['origin'] === metadata['origin']) {
                delete payload['iat']
                delete payload['exp']
                delete payload['jti']

                return this.getAccessToken(payload)
            }
            // if (payload['ipAddr'] === metadata.ipAddr) {
            //     delete payload['iat']
            //     delete payload['exp']
            //     delete payload['jti']

            //     return this.getAccessToken(payload)
            // }
        } catch (err) {
            Logger.error(err.message)
            return null
        }
    }

    /**
     * Get user's role by id
     * @param id
     * return `{role}`
     */
    async getRole(id: string): Promise<User> {
        const options: FindOneOptions<User> = { projection: { role: 1 } }
        return this.userCollection.findOne(this.buildFilterId(id), options)
    }

    private async checkUser(username: string, pass: string, cms: boolean): Promise<Omit<User, 'password'> | null> {
        const user: User = await this.findUserByUsername(username)
        if (user && bcrypt.compareSync(pass, user.password) && (!cms || user.role === ADMIN)) {
            delete user.password
            return user
        }
        return null
    }

    private getMetadataFromRequest(req: Request): object {
        Logger.log('request header', JSON.stringify(req.headers, null, '\t'))
        const { origin } = req.headers
        return { origin }
        // const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        // return { ipAddr }
    }

    async findUserByUsername(username: string): Promise<User> {
        const filter = this.notDeleted({ username })
        const options = { projection: { userId: 1, unit: 1, name: 1, username: 1, role: 1, password: 1 } }
        return this.userCollection.findOne(filter, options)
    }

    async findUserById(id: string, option?: FindOneAndDeleteOption<User>): Promise<User> {
        const filter = this.buildFilterId(id)
        return this.userCollection.findOne(filter, option)
    }

    async changePassword(id: string, newPassword: string): Promise<boolean> {
        const { modifiedCount } = await this.userCollection.updateOne(
            { _id: new ObjectId(id) },
            this.setStage({ password: bcrypt.hashSync(newPassword) })
        )
        return modifiedCount === 1
    }

    private getRefreshToken(payload: AuthUser, metadata: object): string {
        return this.jwtService.sign(
            { ...payload, ...metadata },
            {
                issuer: 'Newstransport',
                expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
                jwtid: JWT_REFRESH_TOKEN_ID
            }
        )
    }

    private getAccessToken(payload: AuthUser): string {
        return this.jwtService.sign(payload, { jwtid: JWT_ACCESS_TOKEN_ID })
    }

    private getPayloadFromUser(user: User): AuthUser {
        return {
            userId: user._id.toHexString(),
            username: user.username,
            name: user.name,
            unit: user.unit,
            role: user.role
        }
    }

    validateToken(accessToken: string, options?: jwt.VerifyOptions): AuthUser {
        return this.jwtService.verify<AuthUser>(accessToken, options)
    }
}
