import { Module } from '@nestjs/common'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { CollectionList } from 'src/share/constants/collection.constant'
import { ExportService } from 'src/share/service/export.service'
import { WinstonModule } from 'src/winston/winston.module'
import { BillController } from './bill.controller'
import { BillService } from './bill.service'

/**
 * Bill Module
 * @author Khoa
 */
@Module({
    imports: [
        MongodbModule.useCollection(CollectionList.BILL_COLLECTION),
        MongodbModule.useCollection(CollectionList.SERVICE_COLLECTION),
        MongodbModule.useCollection(CollectionList.PROVINCE_COLLECTION),
        MongodbModule.useCollection(CollectionList.PROGRESS_COLLECTION),
        MongodbModule.useCollection(CollectionList.PACKAGE_COLLECTION),
        MongodbModule.useCollection(CollectionList.FINANCE_COLLECTION),
        MongodbModule.useCollection(CollectionList.TRUCK_COLLECTION),
        WinstonModule.useServiceLogger(CollectionList.BILL_COLLECTION)
    ],
    controllers: [BillController],
    providers: [BillService, ExportService]
})
export class BillModule {}
