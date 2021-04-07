import { HttpService, Inject, Injectable } from '@nestjs/common'
import { BulkWriteOperation, Collection, ObjectId } from 'mongodb'
import { retry } from 'rxjs/operators'
import { parseMongoId, removeUndefinedProperty } from 'src/share/common'
import { EMPTY_OBJECT, UPLOAD_IMAGE_URL } from 'src/share/constants/app-constant'
import { CollectionList } from 'src/share/constants/collection.constant'
import { BaseService } from 'src/share/service/base.service'
import { WinstonLogger } from 'src/winston/winston.classes'
import { InjectLogger } from 'src/winston/winston.decorators'
import { Banner } from './banner.interface'
import { BannerValidator } from './banner.validator'

/**
 * Banner Service
 * @author KhoaVD
 */

@Injectable()
export class BannerService extends BaseService<Banner> {
    constructor(
        private httpService: HttpService,
        @Inject(CollectionList.BANNER_COLLECTION) private collection: Collection<Banner>,
        @InjectLogger(CollectionList.BANNER_COLLECTION) private readonly bannerLogger: WinstonLogger
    ) {
        super(bannerLogger)
        this.bannerLogger.setContext(this.constructor.name)
    }

    async create(body: BannerValidator): Promise<object> {
        const count = await this.collection.countDocuments()
        const result = await this.insertOne(this.collection, { ...body, order: count + 1 })
        return result.ops[0] ? result.ops[0] : EMPTY_OBJECT
    }

    async getAll(): Promise<Banner[]> {
        return this.find(this.collection, {}, { sort: { order: 1, insertTime: 1 } })
    }

    async getDetail(_id: ObjectId): Promise<object> {
        const result = await this.findOne(this.collection, { _id })
        return result ? result : EMPTY_OBJECT
    }

    async sort(ids: string[]): Promise<boolean> {
        const result = await this.collection.bulkWrite(
            parseMongoId(ids).map<BulkWriteOperation<Banner>>((_id, index) => ({
                updateOne: {
                    filter: { _id },
                    update: this.setStage({ order: index + 1 })
                }
            }))
        )
        return result.modifiedCount > 0
    }

    async edit(_id: ObjectId, body: BannerValidator): Promise<boolean> {
        removeUndefinedProperty(body)
        const result = await this.collection.updateOne({ _id }, this.setStage(body))
        return result.modifiedCount > 0
    }

    async delete(_id: ObjectId): Promise<void> {
        const { value: banner } = await this.collection.findOneAndDelete({ _id }, { projection: { image: 1 } })
        if (banner === null)
            await this.httpService.delete(UPLOAD_IMAGE_URL, { data: { files: [banner.image.url] } }).pipe(retry(3))
        return
    }
}
