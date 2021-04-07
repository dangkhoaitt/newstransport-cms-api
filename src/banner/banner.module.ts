import { HttpModule, Module } from '@nestjs/common'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { CollectionList } from 'src/share/constants/collection.constant'
import { WinstonModule } from 'src/winston/winston.module'
import { BannerController } from './banner.controller'
import { BannerService } from './banner.service'

/**
 * Banner Module
 * @author KhoaVD
 */

@Module({
    imports: [
        HttpModule,
        MongodbModule.useCollection(CollectionList.BANNER_COLLECTION),
        WinstonModule.useServiceLogger(CollectionList.BANNER_COLLECTION)
    ],
    providers: [BannerService],
    controllers: [BannerController]
})
export class BannerModule {}
