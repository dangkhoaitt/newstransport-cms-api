import { Module } from '@nestjs/common'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { CollectionList } from 'src/share/constants/collection.constant'
import { WinstonModule } from 'src/winston/winston.module'
import { ServiceController } from './service.controller'
import { ServiceService } from './service.service'

/**
 * Service Module
 * @author Khoa
 */
@Module({
    imports: [
        MongodbModule.useCollection(CollectionList.SERVICE_COLLECTION),
        MongodbModule.useCollection(CollectionList.PROVINCE_COLLECTION),
        MongodbModule.useCollection(CollectionList.TRUCK_COLLECTION),
        WinstonModule.useServiceLogger(CollectionList.SERVICE_COLLECTION)
    ],
    controllers: [ServiceController],
    providers: [ServiceService]
})
export class ServiceModule {}
