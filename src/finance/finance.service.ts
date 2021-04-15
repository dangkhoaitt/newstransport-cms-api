import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { Collection, ObjectId } from 'mongodb'
import { CollectionList } from 'src/share/constants/collection.constant'
import { BaseService } from 'src/share/service/base.service'
import { WinstonLogger } from 'src/winston/winston.classes'
import { InjectLogger } from 'src/winston/winston.decorators'
import { isNullOrUndefined } from '../share/common'
import { Finance } from './finance.interface'
import { FinanceValidator } from './finance.validator'

/**
 * Finance Service
 * @author Khoa
 */
@Injectable()
export class FinanceService extends BaseService<Finance> {
    constructor(
        @Inject(CollectionList.FINANCE_COLLECTION) private collection: Collection<Finance>,
        @InjectLogger(CollectionList.FINANCE_COLLECTION) private readonly financeLogger: WinstonLogger
    ) {
        super(financeLogger)
        this.financeLogger.setContext(this.constructor.name)
    }

    /**
     * get all finances
     * @returns all Finance documents
     */
    async getAll(): Promise<object[]> {
        const result = await this.find(this.collection, {})
        return await this.includeOrder(result, 'finance')
    }

    /**
     * get finance detail
     * @param id
     * @returns finance document
     */
    async getDetail(id: string): Promise<object> {
        const finance = await this.findOne(this.collection, { _id: new ObjectId(id) })
        if (!finance) throw new HttpException('', HttpStatus.NO_CONTENT)
        const order = await this.getOrder('finance')
        finance['order'] = order?.['idList'].indexOf(id) + 1
        return finance
    }

    /**
     * insert finance
     * @param body
     * @return finance document
     */
    async insert(body: FinanceValidator): Promise<object> {
        const order = body.order || 1
        const result = await this.insertOne(this.collection, { ...body, order: undefined })
        await this.insertOrder('finance', result.ops[0]._id.toString(), order)
        return this.getDetail(result.ops[0]._id.toString())
    }

    /**
     * edit finance
     * @param body
     * @param id
     * @return finance document
     */
    async edit(id: string, body: FinanceValidator): Promise<object> {
        if (!isNullOrUndefined(body.name)) {
            const result = await this.findOneAndUpdate(this.collection, { _id: new ObjectId(id) }, { name: body.name })
            if (!result.value) throw new HttpException('', HttpStatus.NO_CONTENT)
        }
        if (!isNullOrUndefined(body['order'])) await this.updateOrder('finance', id, body['order'])
        return this.getDetail(id)
    }

    /**
     * delete finance
     * @param id
     * @return null
     */
    async delete(id: string): Promise<boolean> {
        const result = await this.deleteOne(this.collection, { _id: new ObjectId(id) })
        if (!result.modifiedCount) throw new HttpException('trạng thái kế toán không tồn tại', HttpStatus.BAD_REQUEST)
        await this.deleteOrder('finance', id)
        return null
    }
}
