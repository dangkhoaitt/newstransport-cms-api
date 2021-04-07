import { Module } from '@nestjs/common'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { CollectionList } from 'src/share/constants/collection.constant'
import { FrontSettingsController } from './front-settings.controller'
import { FrontSettingsService } from './front-settings.service'

@Module({
    imports: [MongodbModule.useCollection(CollectionList.FRONT_SETTINGS_COLLECTION)],
    controllers: [FrontSettingsController],
    providers: [FrontSettingsService]
})
export class FrontSettingsModule {}
