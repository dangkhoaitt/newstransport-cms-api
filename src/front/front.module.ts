import { Module } from '@nestjs/common'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { FRONT_KEY_LOGGER } from 'src/share/constants/app-constant'
import { CollectionList } from 'src/share/constants/collection.constant'
import { WinstonModule } from 'src/winston/winston.module'
import { FrontController } from './front.controller'
import { FrontService } from './front.service'

/**
 * front Module
 * @author KhoaVD
 */

@Module({
    imports: [
        MongodbModule.useCollection(CollectionList.POST_DEFAULT_COLLECTION),
        MongodbModule.useCollection(CollectionList.BANNER_COLLECTION),
        MongodbModule.useCollection(CollectionList.CATEGORY_COLLECTION),
        MongodbModule.useCollection(CollectionList.BILL_COLLECTION),
        MongodbModule.useCollection(CollectionList.QUOTE_COLLECTION),
        MongodbModule.useCollection(CollectionList.PROGRESS_COLLECTION),
        WinstonModule.useServiceLogger(FRONT_KEY_LOGGER)
    ],
    controllers: [FrontController],
    providers: [FrontService]
})
export class FrontModule {}
