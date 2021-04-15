import { Module } from '@nestjs/common'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { CollectionList } from 'src/share/constants/collection.constant'
import { WinstonModule } from 'src/winston/winston.module'
import { CustomerController } from './customer.controller'
import { CustomerService } from './customer.service'

/**
 * Customer Module
 * @author KhoaVD
 */
@Module({
    imports: [
        MongodbModule.useCollection(CollectionList.CUSTOMER_COLLECTION),
        MongodbModule.useCollection(CollectionList.PROVINCE_COLLECTION),
        WinstonModule.useServiceLogger(CollectionList.CUSTOMER_COLLECTION)
    ],
    controllers: [CustomerController],
    providers: [CustomerService]
})
export class CustomerModule {}
