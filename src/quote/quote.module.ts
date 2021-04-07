import { Module } from '@nestjs/common'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { CollectionList } from 'src/share/constants/collection.constant'
import { WinstonModule } from 'src/winston/winston.module'
import { QuoteController } from './quote.controller'
import { QuoteService } from './quote.service'

/**
 * Quote Module
 * @author Thuan
 */
@Module({
    imports: [
        MongodbModule.useCollection(CollectionList.QUOTE_COLLECTION),
        WinstonModule.useServiceLogger(CollectionList.QUOTE_COLLECTION)
    ],
    controllers: [QuoteController],
    providers: [QuoteService]
})
export class QuoteModule {}
