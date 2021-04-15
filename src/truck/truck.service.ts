import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { Collection, ObjectId } from 'mongodb'
import { CollectionList } from 'src/share/constants/collection.constant'
import { BaseService } from 'src/share/service/base.service'
import { WinstonLogger } from 'src/winston/winston.classes'
import { InjectLogger } from 'src/winston/winston.decorators'
import { isNullOrUndefined } from '../share/common'
import { Truck } from './truck.interface'
import { TruckValidator } from './truck.validator'

/**
 * Truck Service
 * @author Khoa
 */
@Injectable()
export class TruckService extends BaseService<Truck> {
    constructor(
        @Inject(CollectionList.TRUCK_COLLECTION) private collection: Collection<Truck>,
        @InjectLogger(CollectionList.TRUCK_COLLECTION) private readonly truckLogger: WinstonLogger
    ) {
        super(truckLogger)
        this.truckLogger.setContext(this.constructor.name)
    }

    /**
     * get all truck
     * @returns all truck documents
     */
    async getAll(): Promise<object[]> {
        const result = await this.find(this.collection, {})
        return await this.includeOrder(result, 'truck')
    }

    /**
     * get truck detail
     * @param id
     * @returns truck document
     */
    async getDetail(id: string): Promise<object> {
        const truck = await this.findOne(this.collection, { _id: new ObjectId(id) })
        if (!truck) throw new HttpException('', HttpStatus.NO_CONTENT)
        const order = await this.getOrder('truck')
        truck['order'] = order?.['idList'].indexOf(id) + 1
        return truck
    }

    /**
     * insert truck
     * @param body
     * @return truck document
     */
    async insert(body: TruckValidator): Promise<object> {
        const order = body.order || 1

        const result = await this.insertOne(this.collection, { ...body, order: undefined })
        await this.insertOrder('truck', result.ops[0]._id.toString(), order)

        return this.getDetail(result.ops[0]._id.toString())
    }

    /**
     * edit truck
     * @param body
     * @param id
     * @return truck document
     */
    async edit(id: string, body: TruckValidator): Promise<object> {
        if (!isNullOrUndefined(body.name)) {
            const result = await this.findOneAndUpdate(this.collection, { _id: new ObjectId(id) }, { name: body.name })
            if (!result.value) throw new HttpException('', HttpStatus.NO_CONTENT)
        }
        if (!isNullOrUndefined(body['order'])) await this.updateOrder('truck', id, body['order'])
        return this.getDetail(id)
    }

    /**
     * delete truck
     * @param id
     * @return null
     */
    async delete(id: string): Promise<boolean> {
        const result = await this.deleteOne(this.collection, { _id: new ObjectId(id) })
        if (!result.modifiedCount) throw new HttpException('trạng thái kế toán không tồn tại', HttpStatus.BAD_REQUEST)

        await this.deleteOrder('truck', id)
        return null
    }
}
