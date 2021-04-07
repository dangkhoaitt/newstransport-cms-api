import { Module } from '@nestjs/common'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { CollectionList } from 'src/share/constants/collection.constant'
import { WinstonModule } from 'src/winston/winston.module'
import { UnitController } from './unit.controller'
import { UnitService } from './unit.service'

/**
 * Unit Module
 * @author Thuan
 */
@Module({
    imports: [
        MongodbModule.useCollection(CollectionList.UNIT_COLLECTION),
        WinstonModule.useServiceLogger(CollectionList.UNIT_COLLECTION)
    ],
    controllers: [UnitController],
    providers: [UnitService]
})
export class UnitModule {}
