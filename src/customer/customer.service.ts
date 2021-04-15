import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { isMongoId } from 'class-validator'
import { Collection, ObjectId } from 'mongodb'
import { Province } from 'src/province/province.interface'
import { isTrue } from 'src/share/common'
import { EMPTY_OBJECT } from 'src/share/constants/app-constant'
import { CollectionList } from 'src/share/constants/collection.constant'
import { BaseService } from 'src/share/service/base.service'
import { BooleanString } from 'src/share/types'
import { WinstonLogger } from 'src/winston/winston.classes'
import { InjectLogger } from 'src/winston/winston.decorators'
import { Customer } from './customer.interface'
import { CustomerValidator } from './customer.validator'

/**
 * Customer Service
 * @author KhoaVD
 */
@Injectable()
export class CustomerService extends BaseService<Customer> {
    constructor(
        @Inject(CollectionList.CUSTOMER_COLLECTION) private collection: Collection<Customer>,
        @Inject(CollectionList.PROVINCE_COLLECTION) private provinceCollection: Collection<Province>,
        @InjectLogger(CollectionList.CUSTOMER_COLLECTION) private readonly customerLogger: WinstonLogger
    ) {
        super(customerLogger)
        this.customerLogger.setContext(this.constructor.name)
    }

    /**
     * get all customers
     * @returns all customer documents
     */
    async getAll(): Promise<object[]> {
        return await this.find(this.collection, {}, { projection: { insertTime: 0, updateTime: 0 } })
    }

    /**
     * get customer detail
     * @param param
     * @param isCode
     * @returns customer document
     */
    async getDetail(param: string, isCode: BooleanString): Promise<object> {
        if (!isTrue(isCode) && !isMongoId(param))
            throw new HttpException('id must be a mongodb id', HttpStatus.BAD_REQUEST)
        const customer = await this.findOne(
            this.collection,
            isTrue(isCode) ? { code: param } : { _id: new ObjectId(param) }
        )
        if (!customer) throw new HttpException('Khách hàng không tồn tại', HttpStatus.BAD_REQUEST)
        return customer
    }

    /**
     * insert customer
     * @param body
     * @return customer document
     */
    async insert(body: CustomerValidator): Promise<object> {
        const { province, district, code, ...customerInfo } = body
        const objProvince = await this.findOne<Province>(
            this.provinceCollection,
            { code: province },
            { projection: { code: 1, name: 1, district: 1 } }
        )
        if (!objProvince) throw new HttpException('Tỉnh/Thành không hợp lệ', HttpStatus.BAD_REQUEST)

        const objDistrict = objProvince.district?.find(c => c.code === district)
        if (!objDistrict) throw new HttpException('Quận/Huyện không hợp lệ', HttpStatus.BAD_REQUEST)

        const insert = {
            code: code ? code : await this.autoGenerateCode(),
            ...customerInfo,
            province: { code: objProvince.code, name: objProvince.name },
            district: objDistrict
        }
        const result = await this.insertOne(this.collection, insert)
        return result.ops[0] ? result.ops[0] : EMPTY_OBJECT
    }
    private async autoGenerateCode(): Promise<string> {
        const num = await this.getNextSequence('customerCode')
        const code = '000000' + num
        return `KH${code.slice(-6)}`
    }

    /**
     * edit customer
     * @param body
     * @param id
     * @return customer document
     */
    async edit(id: string, body: CustomerValidator): Promise<object> {
        const { province, district, ...customerInfo } = body
        if (province) {
            const objProvince = await this.findOne<Province>(
                this.provinceCollection,
                { code: province },
                { projection: { code: 1, name: 1, district: 1 } }
            )
            if (!objProvince) throw new HttpException('Tỉnh/Thành không hợp lệ', HttpStatus.BAD_REQUEST)

            const objDistrict = objProvince.district?.find(c => c.code === district)
            if (!objDistrict) throw new HttpException('Quận/Huyện không hợp lệ', HttpStatus.BAD_REQUEST)

            customerInfo['province'] = { code: objProvince.code, name: objProvince.name }
            customerInfo['district'] = objDistrict
        } else if (district) {
            const customer = await this.findOne(
                this.collection,
                { _id: new ObjectId(id) },
                { projection: { province: 1 } }
            )
            if (!customer) throw new HttpException('Khách hàng không tồn tại', HttpStatus.BAD_REQUEST)

            const objProvince = await this.findOne<Province>(
                this.provinceCollection,
                { code: customer.province.code },
                { projection: { code: 1, name: 1, district: 1 } }
            )
            const objDistrict = objProvince.district?.find(c => c.code === district)
            if (!district) throw new HttpException('Quận/Huyện không hợp lệ', HttpStatus.BAD_REQUEST)

            customerInfo['district'] = objDistrict
        }
        const result = await this.findOneAndUpdate(this.collection, { _id: new ObjectId(id) }, customerInfo)
        if (!result.value) throw new HttpException('Khách hàng không tồn tại', HttpStatus.BAD_REQUEST)
        return result.value
    }

    /**
     * delete customer
     * @param id
     * @return null
     */
    async delete(id: string): Promise<boolean> {
        const result = await this.deleteOne(this.collection, { _id: new ObjectId(id) })
        if (!result.modifiedCount) throw new HttpException('Khách hàng không tồn tại', HttpStatus.BAD_REQUEST)
        return null
    }
}
