import { Module } from '@nestjs/common'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { CollectionList } from 'src/share/constants/collection.constant'
import { WinstonModule } from 'src/winston/winston.module'
import { ProgressController } from './progress.controller'
import { ProgressService } from './progress.service'

/**
 * Progress Module
 * @author Thuan
 */
@Module({
    imports: [
        MongodbModule.useCollection(CollectionList.PROGRESS_COLLECTION),
        WinstonModule.useServiceLogger(CollectionList.PROGRESS_COLLECTION)
    ],
    controllers: [ProgressController],
    providers: [ProgressService]
})
export class ProgressModule {}
