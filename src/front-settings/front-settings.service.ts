import { Inject, Injectable } from '@nestjs/common'
import { Collection } from 'mongodb'
import { CollectionList, LANG_VI } from 'src/share/constants/collection.constant'
import { FrontSettings } from './front-settings.interface'
import { FrontSettingsValidator } from './front-settings.validator'

@Injectable()
export class FrontSettingsService {
    @Inject(CollectionList.FRONT_SETTINGS_COLLECTION) private collection: Collection<FrontSettings>

    async getAll(): Promise<FrontSettings> {
        const frontSettings = await this.collection.find({}).toArray()
        return frontSettings[0]
    }

    async update(body: FrontSettingsValidator): Promise<boolean> {
        const { language = LANG_VI, ...settings } = body
        const currentSetting = await this.getAll()
        const { modifiedCount } = await this.collection.updateMany(
            {},
            { $set: { [language]: { ...currentSetting[language], ...settings } } }
        )
        return modifiedCount > 0
    }
}
