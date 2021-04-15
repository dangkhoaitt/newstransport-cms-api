import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { Collection, ObjectId } from 'mongodb'
import { EMPTY_OBJECT } from 'src/share/constants/app-constant'
import { CollectionList } from 'src/share/constants/collection.constant'
import { BaseService } from 'src/share/service/base.service'
import { WinstonLogger } from 'src/winston/winston.classes'
import { InjectLogger } from 'src/winston/winston.decorators'
import { Quote } from './quote.interface'

/**
 * Quote Service
 * @author KhoaVD
 */
@Injectable()
export class QuoteService extends BaseService<Quote> {
    constructor(
        @Inject(CollectionList.QUOTE_COLLECTION) private collection: Collection<Quote>,
        @InjectLogger(CollectionList.QUOTE_COLLECTION) private readonly quoteLogger: WinstonLogger
    ) {
        super(quoteLogger)
        this.quoteLogger.setContext(this.constructor.name)
    }

    /**
     * get all quote
     * @returns all quote documents
     */
    async getAll(): Promise<object[]> {
        return (await this.find(this.collection, {})).sort((a, b) => b.insertTime - a.insertTime)
    }

    /**
     * get quote detail
     * @param id
     * @returns quote document
     */
    async getDetail(_id: ObjectId): Promise<object> {
        const collection = this.db.collection(CollectionList.QUOTE_COLLECTION)
        const pipeLine: object[] = []
        pipeLine.push(this.matchStage({ _id }))
        const result = await collection.aggregate(pipeLine).toArray()
        return result.length > 0 ? result[0] : EMPTY_OBJECT
    }

    /**
     * edit quote
     * @param id
     * @return quote document
     */
    async send(id: string): Promise<object> {
        const result = await this.findOneAndUpdate(this.collection, { _id: new ObjectId(id) }, { status: 2 })
        if (result.value) return result.value
        throw new HttpException('', HttpStatus.NO_CONTENT)
    }

    /**
     * delete quote
     * @param id
     * @return null
     */
    async delete(id: string): Promise<boolean> {
        const result = await this.deleteOne(this.collection, { _id: new ObjectId(id) })
        if (!result.modifiedCount) throw new HttpException('yêu cầu báo giá không tồn tại', HttpStatus.BAD_REQUEST)
        return null
    }
}
