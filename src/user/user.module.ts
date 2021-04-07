import { Module } from '@nestjs/common'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { CollectionList } from 'src/share/constants/collection.constant'
import { WinstonModule } from 'src/winston/winston.module'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { CanDeletevalidation, CanEditValidation } from './user.validator'

/**
 * User Module
 * @author KhoaVD
 */
@Module({
    imports: [
        MongodbModule.useCollection(CollectionList.USER_COLLECTION),
        WinstonModule.useServiceLogger(CollectionList.USER_COLLECTION),
        MongodbModule.useCollection(CollectionList.UNIT_COLLECTION),
        WinstonModule.useServiceLogger(CollectionList.UNIT_COLLECTION)
    ],
    providers: [UserService, CanEditValidation, CanDeletevalidation],
    controllers: [UserController]
})
export class UserModule {}
