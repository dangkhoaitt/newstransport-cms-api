import { Module } from '@nestjs/common'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { CollectionList } from 'src/share/constants/collection.constant'
import { WinstonModule } from 'src/winston/winston.module'
import { TruckController } from './truck.controller'
import { TruckService } from './truck.service'

/**
 * Truck Module
 * @author Thuan
 */
@Module({
    imports: [
        MongodbModule.useCollection(CollectionList.TRUCK_COLLECTION),
        WinstonModule.useServiceLogger(CollectionList.TRUCK_COLLECTION)
    ],
    controllers: [TruckController],
    providers: [TruckService]
})
export class TruckModule {}
