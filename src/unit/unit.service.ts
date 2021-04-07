import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { Collection, ObjectId } from 'mongodb'
import { CollectionList } from 'src/share/constants/collection.constant'
import { BaseService } from 'src/share/service/base.service'
import { WinstonLogger } from 'src/winston/winston.classes'
import { InjectLogger } from 'src/winston/winston.decorators'
import { isNullOrUndefined } from '../share/common'
import { Unit } from './unit.interface'
import { UnitValidator } from './unit.validator'

/**
 * Unit Service
 * @author Thuan
 */
@Injectable()
export class UnitService extends BaseService<Unit> {
    constructor(
        @Inject(CollectionList.UNIT_COLLECTION) private collection: Collection<Unit>,
        @InjectLogger(CollectionList.UNIT_COLLECTION) private readonly unitLogger: WinstonLogger
    ) {
        super(unitLogger)
        this.unitLogger.setContext(this.constructor.name)
    }

    /**
     * get all unit
     * @returns all unit documents
     */

    async getAll(): Promise<object[]> {
        const result = await this.find(this.collection, {})
        return await this.includeOrder(result, 'unit')
    }

    /**
     * get unit detail
     * @param id
     * @returns unit document
     */
    async getDetail(id: string): Promise<object> {
        const unit = await this.findOne(this.collection, { _id: new ObjectId(id) })
        unit['users'] = await this.find(this.db.collection('user'), {
            'unit.code': unit.code
        })
        unit['bills'] = await this.find(
            this.db.collection('bill'),
            this.orOperator(
                {
                    'unit.code': unit.code
                },
                {
                    'deliverUnit.code': unit.code
                }
            )
        )
        if (!unit) throw new HttpException('', HttpStatus.NO_CONTENT)
        const order = await this.getOrder('unit')
        unit['order'] = order?.['idList'].indexOf(id) + 1
        return unit
    }

    /**
     * insert unit
     * @param body
     * @return unit document
     */
    async insert(body: UnitValidator): Promise<object> {
        const order = body.order || 1

        const result = await this.insertOne(this.collection, { ...body, order: undefined })
        await this.insertOrder('unit', result.ops[0]._id.toString(), order)
        return this.getDetail(result.ops[0]._id.toString())
    }

    /**
     * edit unit
     * @param body
     * @param id
     * @return unit document
     */
    async edit(id: string, body: UnitValidator): Promise<object> {
        if (!isNullOrUndefined(body.name)) {
            const result = await this.findOneAndUpdate(this.collection, { _id: new ObjectId(id) }, { name: body.name })
            if (!result.value) throw new HttpException('', HttpStatus.NO_CONTENT)
        }

        if (!isNullOrUndefined(body['order'])) await this.updateOrder('unit', id, body['order'])
        return this.getDetail(id)
    }

    /**
     * delete unit
     * @param id
     * @return null
     */
    async delete(id: string): Promise<boolean> {
        const result = await this.deleteOne(this.collection, { _id: new ObjectId(id) })
        if (!result.modifiedCount) throw new HttpException('trạng thái kế toán không tồn tại', HttpStatus.BAD_REQUEST)
        await this.deleteOrder('unit', id)
        return null
    }
}
