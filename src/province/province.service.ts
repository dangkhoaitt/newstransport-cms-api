import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { Collection, ObjectId } from 'mongodb'
import { CollectionList } from 'src/share/constants/collection.constant'
import { BaseService } from 'src/share/service/base.service'
import { WinstonLogger } from 'src/winston/winston.classes'
import { InjectLogger } from 'src/winston/winston.decorators'
import { isNullOrUndefined } from '../share/common'
import { Province } from './province.interface'
import { InsertProvinceValidator, ProvinceValidator } from './province.validator'

/**
 * Province Service
 * @author Thuan
 */
@Injectable()
export class ProvinceService extends BaseService<Province> {
    constructor(
        @Inject(CollectionList.PROVINCE_COLLECTION) private collection: Collection<Province>,
        @InjectLogger(CollectionList.PROVINCE_COLLECTION) private readonly provinceLogger: WinstonLogger
    ) {
        super(provinceLogger)
        this.provinceLogger.setContext(this.constructor.name)
    }

    /**
     * get all province
     * @returns all province documents
     */
    async getAll(): Promise<object[]> {
        const result = await this.find(this.collection, {})
        return await this.includeOrder(result, 'province')
    }

    /**
     * get province detail
     * @param id
     * @returns province document
     */
    async getDetail(id: string): Promise<object> {
        const province = await this.findOne(this.collection, { _id: new ObjectId(id) })
        if (!province) throw new HttpException('', HttpStatus.NO_CONTENT)
        const order = await this.getOrder('province')
        province['order'] = order?.['idList'].indexOf(id) + 1
        return province
    }

    /**
     * insert province
     * @param body
     * @return province document
     */
    async insert(body: InsertProvinceValidator): Promise<object> {
        const collection = this.db.collection(CollectionList.PROVINCE_COLLECTION)
        if (body.district) {
            const codes = body.district.map(c => c.code)
            if (this.isDuplicated(codes)) throw new HttpException('duplicate district code', HttpStatus.BAD_REQUEST)
        }
        const result = await this.insertOne(collection, { ...body })
        await this.insertOrder('province', result.ops[0]._id.toString(), body['order'])
        result.ops[0]['order'] = body['order']
        return result.ops[0]
    }

    /**
     * edit province
     * @param body
     * @param id
     * @return province document
     */
    async edit(id: string, body: ProvinceValidator): Promise<object> {
        if (body.district) {
            const codes = body.district.map(c => c.code)
            if (this.isDuplicated(codes)) throw new HttpException('duplicate district code', HttpStatus.BAD_REQUEST)
        }
        const result = await this.findOneAndUpdate(this.collection, { _id: new ObjectId(id) }, body)
        if (!result.value) throw new HttpException('', HttpStatus.NO_CONTENT)
        if (!isNullOrUndefined(body['order'])) await this.updateOrder('province', id, body['order'])
        return this.getDetail(id)
    }

    private isDuplicated(arr: number[]): boolean {
        return new Set(arr).size !== arr.length
    }

    /**
     * delete province
     * @param id
     * @return null
     */
    async delete(id: string): Promise<boolean> {
        const result = await this.deleteOne(this.collection, { _id: new ObjectId(id) })
        if (!result.modifiedCount) throw new HttpException('trạng thái kế toán không tồn tại', HttpStatus.BAD_REQUEST)
        await this.deleteOrder('province', id)

        return null
    }
}
