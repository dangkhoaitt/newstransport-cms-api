import { Module } from '@nestjs/common'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { CollectionList } from 'src/share/constants/collection.constant'
import { WinstonModule } from 'src/winston/winston.module'
import { PackageController } from './package.controller'
import { PackageService } from './package.service'

/**
 * Package Module
 * @author Thuan
 */
@Module({
    imports: [
        MongodbModule.useCollection(CollectionList.PACKAGE_COLLECTION),
        WinstonModule.useServiceLogger(CollectionList.PACKAGE_COLLECTION)
    ],
    controllers: [PackageController],
    providers: [PackageService]
})
export class PackageModule {}
