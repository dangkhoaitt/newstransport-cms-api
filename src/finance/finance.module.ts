import { Module } from '@nestjs/common'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { CollectionList } from 'src/share/constants/collection.constant'
import { WinstonModule } from 'src/winston/winston.module'
import { FinanceController } from './finance.controller'
import { FinanceService } from './finance.service'

/**
 * Finance Module
 * @author Khoa
 */
@Module({
    imports: [
        MongodbModule.useCollection(CollectionList.FINANCE_COLLECTION),
        WinstonModule.useServiceLogger(CollectionList.FINANCE_COLLECTION)
    ],
    controllers: [FinanceController],
    providers: [FinanceService]
})
export class FinanceModule {}
