import { Module } from '@nestjs/common'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { CollectionList } from 'src/share/constants/collection.constant'
import { WinstonModule } from 'src/winston/winston.module'
import { DomainController } from './domain.controller'
import { DomainService } from './domain.service'
import { IsDomainUniqueConstraint } from './domain.validator'

/**
 * Domain Module
 * @author CuongNQ
 */
@Module({
    imports: [
        MongodbModule.useCollection(CollectionList.DOMAIN_COLLECTION),
        WinstonModule.useServiceLogger(CollectionList.DOMAIN_COLLECTION)
    ],
    controllers: [DomainController],
    providers: [DomainService, IsDomainUniqueConstraint]
})
export class DomainModule {}
