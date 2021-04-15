import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { Collection, ObjectId } from 'mongodb'
import { Province } from 'src/province/province.interface'
import { EMPTY_LIST } from 'src/share/constants/app-constant'
import { CollectionList } from 'src/share/constants/collection.constant'
import { BaseService, Facet } from 'src/share/service/base.service'
import { Truck } from 'src/truck/truck.interface'
import { WinstonLogger } from 'src/winston/winston.classes'
import { InjectLogger } from 'src/winston/winston.decorators'
import { isNullOrUndefined, isObjectEmpty, isTrue, isUndefined } from '../share/common'
import { Service } from './service.interface'
import { ServiceBody, ServiceSearch } from './service.validator'

/**
 * Service Service
 * @author KhoaVD
 */
@Injectable()
export class ServiceService extends BaseService<Service> {
    constructor(
        @Inject(CollectionList.SERVICE_COLLECTION) private collection: Collection<Service>,
        @Inject(CollectionList.PROVINCE_COLLECTION) private provinceCollection: Collection<Province>,
        @Inject(CollectionList.TRUCK_COLLECTION) private truckCollection: Collection<Truck>,
        @InjectLogger(CollectionList.SERVICE_COLLECTION) private readonly serviceLogger: WinstonLogger
    ) {
        super(serviceLogger)
        this.serviceLogger.setContext(this.constructor.name)
    }

    /**
     * This method is get all "services"
     * @returns Facet
     */
    async getAll(input?: ServiceSearch): Promise<object[]> {
        const filter = {}
        if (!isUndefined(input.code)) filter['code'] = new RegExp('.*' + input.code + '.*')
        if (!isUndefined(input.name)) filter['name'] = new RegExp('.*' + input.name + '.*')
        if (!isUndefined(input.isExtra)) filter['isExtra'] = isTrue(input.isExtra)

        const result = await this.find(this.collection, filter)
        return await this.includeOrder(await this.includeOrder(result, 'extra-service'), 'main-service')
    }

    /**
     * This method is get detail 'service'
     * @param _id
     * @returns serviceDetail || EMPTY_OBJECT
     */
    async getDetail(id: string): Promise<object> {
        const service = await this.findOne(this.collection, { _id: new ObjectId(id) })
        if (!service) throw new HttpException('', HttpStatus.NO_CONTENT)
        const order = await this.getOrder(service.isExtra ? 'extra-service' : 'main-service')
        const orderIndex = order?.['idList'].indexOf(id) + 1
        service['order'] = orderIndex
        return service
    }

    /**
     * This method is insert 'service'
     * @param body
     * @return insertService || EMPTY_OBJECT
     */
    async insert(body: ServiceBody): Promise<object> {
        if (!body['isFix'] && !body['isDistance'] && !body['isWeight'] && !body['isTruck'])
            throw new HttpException('Loại của dịch vụ không đúng', HttpStatus.BAD_REQUEST)
        const provinceAndDistrict = []
        if (body.isDistance) {
            const provinces = await this.provinceCollection.find({ deleteTime: this.eqCondition(null) }).toArray()
            provinces?.forEach(p => {
                p.district?.forEach(d => {
                    provinceAndDistrict.push(d)
                })
                provinceAndDistrict.push(p)
            })
        }
        const trucks = body.isTruck
            ? await this.truckCollection.find({ deleteTime: this.eqCondition(null) }).toArray()
            : undefined

        const distanceArr = []
        body.distanceArr?.forEach(o => {
            if (body.isDistance) {
                if (distanceArr.some(dr => dr.positionFrom == o.positionFrom && dr.positionTo == o.positionTo))
                    throw new HttpException(
                        `Địa điểm bị trùng: ${o.positionFrom}-${o.positionTo}`,
                        HttpStatus.BAD_REQUEST
                    )
                o.positionFromName = provinceAndDistrict.find(pro => pro.code == o.positionFrom)?.name
                o.positionToName = provinceAndDistrict.find(pro => pro.code == o.positionTo)?.name
                if (!o.positionFromName || !o.positionToName)
                    throw new HttpException(
                        `Địa điểm không tồn tại: ${o.positionFrom}-${o.positionTo}`,
                        HttpStatus.BAD_REQUEST
                    )
            }
            const priceArr = []
            o.priceArr.forEach(p => {
                if (body.isTruck) {
                    if (priceArr.some(pr => pr.truckId === p.truckId))
                        throw new HttpException('Loại xe tải bị trùng', HttpStatus.BAD_REQUEST)
                    p.truckName = trucks.find(t => t._id.toString() === p.truckId)?.name
                    p.truckCode = trucks.find(t => t._id.toString() === p.truckId)?.code
                    if (!p.truckName) throw new HttpException('Loại xe tải không tồn tại', HttpStatus.BAD_REQUEST)
                }
                if (body.isWeight) {
                    if (priceArr.some(pr => pr.weightTo === p.weightTo))
                        throw new HttpException('Trọng lượng bị trùng', HttpStatus.BAD_REQUEST)
                }
                priceArr.push(p)
            })
            distanceArr.push(o)
        })
        const document = { ...body, distanceArr }

        const result = await this.insertOne(this.collection, document)
        await this.insertOrder(
            body.isExtra ? 'extra-service' : 'main-service',
            result.ops[0]._id.toString(),
            body['order']
        )
        result.ops[0]['order'] = body['order']
        return result.ops[0]
    }

    async edit(id: string, body: ServiceBody): Promise<object> {
        const service = await this.findOne(this.collection, { _id: new ObjectId(id) })
        if (service.code == 'COD') throw new HttpException('Không thể chỉnh sửa dịch vụ này!', HttpStatus.BAD_REQUEST)
        const document = {}
        if (!isNullOrUndefined(body.name)) document['name'] = body.name
        if (!isNullOrUndefined(body.isExtra)) document['isExtra'] = body.isExtra
        if (!isNullOrUndefined(body.isFix)) document['isFix'] = body.isFix
        if (!isNullOrUndefined(body.weightUnit)) document['weightUnit'] = body.weightUnit
        if (!isNullOrUndefined(body.isDistance)) document['isDistance'] = body.isDistance
        if (!isNullOrUndefined(body.isTruck)) document['isTruck'] = body.isTruck
        if (!isNullOrUndefined(body.isWeight)) document['isWeight'] = body.isWeight
        if (!isNullOrUndefined(body.price)) document['price'] = body.price
        if (!isUndefined(body.distanceArr)) {
            const provinceAndDistrict = []
            if (body.hasOwnProperty('isDistance') ? body.isDistance : service.isDistance) {
                const provinces = await this.provinceCollection.find({ deleteTime: this.eqCondition(null) }).toArray()
                provinces?.forEach(p => {
                    p.district?.forEach(d => {
                        provinceAndDistrict.push(d)
                    })
                    provinceAndDistrict.push(p)
                })
            }
            const trucks = body.isTruck
                ? await this.truckCollection.find({ deleteTime: this.eqCondition(null) }).toArray()
                : undefined

            const distanceArr = []
            body.distanceArr?.forEach(o => {
                if (body.hasOwnProperty('isDistance') ? body.isDistance : service.isDistance) {
                    if (distanceArr.some(dr => dr.positionFrom == o.positionFrom && dr.positionTo == o.positionTo))
                        throw new HttpException(
                            `Địa điểm bị trùng: ${o.positionFrom}-${o.positionTo}`,
                            HttpStatus.BAD_REQUEST
                        )
                    o.positionFromName = provinceAndDistrict.find(pro => pro.code == o.positionFrom)?.name
                    o.positionToName = provinceAndDistrict.find(pro => pro.code == o.positionTo)?.name
                    if (!o.positionFromName || !o.positionToName)
                        throw new HttpException(
                            `Địa điểm không tồn tại: ${o.positionFrom}-${o.positionTo}`,
                            HttpStatus.BAD_REQUEST
                        )
                }
                const priceArr = []
                o.priceArr.forEach(p => {
                    if (body.isTruck) {
                        if (priceArr.some(pr => pr.truckId === p.truckId))
                            throw new HttpException('Loại xe tải bị trùng', HttpStatus.BAD_REQUEST)
                        p.truckName = trucks.find(t => t._id.toString() === p.truckId)?.name
                        p.truckCode = trucks.find(t => t._id.toString() === p.truckId)?.code
                        if (!p.truckName) throw new HttpException('Loại xe tải không tồn tại', HttpStatus.BAD_REQUEST)
                    }
                    if (body.isWeight) {
                        if (priceArr.some(pr => pr.weightTo === p.weightTo))
                            throw new HttpException('Trọng lượng bị trùng', HttpStatus.BAD_REQUEST)
                    }
                    priceArr.push(p)
                })
                distanceArr.push(o)
            })
            document['distanceArr'] = distanceArr
        }
        if (isObjectEmpty(document) && isNullOrUndefined(body['order']))
            throw new HttpException('', HttpStatus.NO_CONTENT)

        const result = await this.findOneAndUpdate(this.collection, { _id: new ObjectId(id) }, body)
        const serviceType = (body.hasOwnProperty('isExtra')
          ? body.isExtra
          : service.isExtra)
            ? 'extra-service'
            : 'main-service'
        if (!isNullOrUndefined(body['order'])) await this.updateOrder(serviceType, id, body['order'])
        if (result.value) return result.value
        throw new HttpException('', HttpStatus.NO_CONTENT)
    }

    async delete(id: string): Promise<boolean> {
        const service = await this.findOne(this.collection, { _id: new ObjectId(id) })
        if (service.code == 'COD') throw new HttpException('Không thể xóa dịch vụ này!', HttpStatus.BAD_REQUEST)
        const result = await this.deleteOne(this.collection, { _id: new ObjectId(id), code: this.neCondition('COD') })
        await this.deleteOrder('service', id)
        if (result.modifiedCount > 0) return null
        throw new HttpException('dịch vụ không tồn tại', HttpStatus.BAD_REQUEST)
    }

    public emptyFacet(): Facet {
        return { data: EMPTY_LIST, totalRecords: 0 }
    }
}
