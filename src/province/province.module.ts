import { Module } from '@nestjs/common'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { CollectionList } from 'src/share/constants/collection.constant'
import { WinstonModule } from 'src/winston/winston.module'
import { ProvinceController } from './province.controller'
import { ProvinceService } from './province.service'

/**
 * Province Module
 * @author KhoaVD
 */
@Module({
    imports: [
        MongodbModule.useCollection(CollectionList.PROVINCE_COLLECTION),
        WinstonModule.useServiceLogger(CollectionList.PROVINCE_COLLECTION)
    ],
    controllers: [ProvinceController],
    providers: [ProvinceService]
})
export class ProvinceModule {}
