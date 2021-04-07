import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { Collection, ObjectId } from 'mongodb'
import { CollectionList } from 'src/share/constants/collection.constant'
import { BaseService } from 'src/share/service/base.service'
import { WinstonLogger } from 'src/winston/winston.classes'
import { InjectLogger } from 'src/winston/winston.decorators'
import { isNullOrUndefined } from '../share/common'
import { Progress } from './progress.interface'
import { ProgressValidator } from './progress.validator'

/**
 * Progress Service
 * @author Thuan
 */
@Injectable()
export class ProgressService extends BaseService<Progress> {
    constructor(
        @Inject(CollectionList.PROGRESS_COLLECTION) private collection: Collection<Progress>,
        @InjectLogger(CollectionList.PROGRESS_COLLECTION) private readonly progressLogger: WinstonLogger
    ) {
        super(progressLogger)
        this.progressLogger.setContext(this.constructor.name)
    }

    /**
     * get all progress
     * @returns all progress documents
     */
    async getAll(): Promise<object[]> {
        const result = await this.find(this.collection, {})
        return await this.includeOrder(result, 'progress')
    }

    /**
     * get progress detail
     * @param id
     * @returns progress document
     */
    async getDetail(id: string): Promise<object> {
        const progress = await this.findOne(this.collection, { _id: new ObjectId(id) })
        if (!progress) throw new HttpException('', HttpStatus.NO_CONTENT)
        const order = await this.getOrder('progress')
        progress['order'] = order?.['idList'].indexOf(id) + 1

        return progress
    }

    /**
     * insert progress
     * @param body
     * @return progress document
     */
    async insert(body: ProgressValidator): Promise<object> {
        const order = body.order || 1

        const result = await this.insertOne(this.collection, { ...body, order: undefined })
        await this.insertOrder('progress', result.ops[0]._id.toString(), order)

        return this.getDetail(result.ops[0]._id.toString())
    }

    /**
     * edit progress
     * @param body
     * @param id
     * @return progress document
     */
    async edit(id: string, body: ProgressValidator): Promise<object> {
        if (!isNullOrUndefined(body.name)) {
            const result = await this.findOneAndUpdate(this.collection, { _id: new ObjectId(id) }, { name: body.name })
            if (!result.value) throw new HttpException('', HttpStatus.NO_CONTENT)
        }
        if (!isNullOrUndefined(body['order'])) await this.updateOrder('progress', id, body['order'])
        return this.getDetail(id)
    }

    /**
     * delete progress
     * @param id
     * @return null
     */
    async delete(id: string): Promise<boolean> {
        const result = await this.deleteOne(this.collection, { _id: new ObjectId(id) })
        if (!result.modifiedCount) throw new HttpException('trạng thái kế toán không tồn tại', HttpStatus.BAD_REQUEST)
        await this.deleteOrder('progress', id)
        return null
    }
}
