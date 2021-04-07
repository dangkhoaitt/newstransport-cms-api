import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { CollectionList } from 'src/share/constants/collection.constant'
import { WinstonModule } from 'src/winston/winston.module'
import { JWT_ACCESS_TOKEN_ID } from './auth.constant'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { IsPasswordValidConstraint } from './validator-constraint'

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt', session: false }),
        JwtModule.registerAsync({
            useFactory: () => {
                return {
                    secret: process.env.JWT_SECRET,
                    signOptions: { expiresIn: parseInt(process.env.JWT_EXPIRES_IN) },
                    verifyOptions: { jwtid: JWT_ACCESS_TOKEN_ID }
                }
            }
        }),
        MongodbModule.useCollection(CollectionList.USER_COLLECTION),
        WinstonModule.useServiceLogger(CollectionList.USER_COLLECTION)
    ],
    controllers: [AuthController],
    providers: [AuthService, IsPasswordValidConstraint],
    exports: [AuthService]
})
export class AuthModule {}
