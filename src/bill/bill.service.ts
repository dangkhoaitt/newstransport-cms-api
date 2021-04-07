import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { isNotEmptyObject } from 'class-validator'
import { Buffer, Column } from 'exceljs'
import * as fs from 'fs'
import { Collection, ObjectId } from 'mongodb'
import { Finance } from 'src/finance/finance.interface'
import { Package } from 'src/package/package.interface'
import { Progress } from 'src/progress/progress.interface'
import { Province } from 'src/province/province.interface'
import { Service } from 'src/service/service.interface'
import { EMPTY_OBJECT } from 'src/share/constants/app-constant'
import { CollectionList, CounterCodes } from 'src/share/constants/collection.constant'
import { RequestHelper } from 'src/share/helpers/request.helper'
import { BaseService, emptyFacet, Facet } from 'src/share/service/base.service'
import { ColumnDefinition, ExportService } from 'src/share/service/export.service'
import { timestampToDateStr } from 'src/share/utils/date.util'
import { Truck } from 'src/truck/truck.interface'
import { Unit } from 'src/unit/unit.interface'
import { User } from 'src/user/user.interface'
import { WinstonLogger } from 'src/winston/winston.classes'
import { InjectLogger } from 'src/winston/winston.decorators'
import { isUndefined } from '../share/common'
import {
    BILL_COLUMN_URL,
    EMPTY_EXPORT,
    EXTRA_SERVICE_EXPORT,
    FORMAT_TIMESTAMP,
    InventoryUnit,
    PERCENT,
    SHEET_NAME,
    VND,
    WeightUnit
} from './bill.constant'
import { Bill, BillExport } from './bill.interface'
import { BillImportValidator, BillSearch, BillValidator, GoodsInfo, UserInfo } from './bill.validator'

/**
 * Bill Service
 * @author Thuan
 */

@Injectable()
export class BillService extends BaseService<Bill> {
    constructor(
        @Inject(CollectionList.BILL_COLLECTION) private collection: Collection<Bill>,
        @Inject(CollectionList.SERVICE_COLLECTION) private serviceCollection: Collection<Service>,
        @Inject(CollectionList.PACKAGE_COLLECTION) private packageCollection: Collection<Package>,
        @Inject(CollectionList.PROVINCE_COLLECTION) private provinceCollection: Collection<Province>,
        @Inject(CollectionList.FINANCE_COLLECTION) private financeCollection: Collection<Finance>,
        @Inject(CollectionList.PROGRESS_COLLECTION) private progressCollection: Collection<Progress>,
        @Inject(CollectionList.TRUCK_COLLECTION) private truckCollection: Collection<Truck>,

        private exportService: ExportService,
        @InjectLogger(CollectionList.BILL_COLLECTION) private readonly billLogger: WinstonLogger
    ) {
        super(billLogger)
        this.billLogger.setContext(this.constructor.name)
    }

    /**
     * get all bills
     * @param query
     * @returns all bill documents
     */
    async getAll(query: BillSearch): Promise<Facet> {
        const pipeline: object[] = []
        const matchFilter = this.getFilter(query)
        pipeline.push(
            this.matchStage(matchFilter),
            this.sortOperator({ updateTime: -1 }),
            this.projectStage(this.projectionGetAll())
        )
        const result = await this.aggregate(this.collection, pipeline, query.page)
        return result.length > 0 ? result[0] : emptyFacet()
    }

    private getFilter(query: BillSearch): object {
        const matchFilter = {}
        if (!isUndefined(query.code)) matchFilter['code'] = new RegExp('.*' + query.code + '.*')
        if (!isUndefined(query.customerCode))
            matchFilter['senderInfo.code'] = new RegExp('.*' + query.customerCode + '.*')
        if (!isUndefined(query.sendName)) matchFilter['senderInfo.name'] = query.sendName
        if (!isUndefined(query.receiveName)) matchFilter['receiverInfo.name'] = query.receiveName
        if (!isUndefined(query.service)) matchFilter['mainService.code'] = query.service
        if (!isUndefined(query.progress)) matchFilter['progress.code'] = query.progress
        if (!isUndefined(query.finance)) matchFilter['finance.code'] = query.finance
        const insertTime = {}
        if (!isUndefined(query.insertTimeFrom)) insertTime['$gte'] = query.insertTimeFrom
        if (!isUndefined(query.insertTimeTo)) insertTime['$lte'] = query.insertTimeTo
        if (isNotEmptyObject(insertTime)) matchFilter['insertTime'] = insertTime
        if (!isUndefined(query.sendUnit)) matchFilter['sendUnit.code'] = query.sendUnit
        if (!isUndefined(query.userId)) matchFilter['insertBy.userId'] = new ObjectId(query.userId)
        return matchFilter
    }

    /**
     * get bill detail
     * @param id
     * @returns bill document
     */
    async getDetail(id: string): Promise<object> {
        const bill = await this.findOne(this.collection, { _id: new ObjectId(id) })
        if (!bill) throw new HttpException('Vận đơn không tồn tại', HttpStatus.BAD_REQUEST)
        return bill
    }

    /**
     * insert bill
     * @param body
     * @return bill document
     */
    async insert(body: BillValidator): Promise<object> {
        const {
            code,
            senderInfo,
            receiverInfo,
            goodsInfo,
            progress,
            finance,
            discount,
            discountUnit,
            deliverMember
        } = body
        const document = { code: code ? code : await this.autoGenerateCode() }
        const provinces = await this.find<Province>(
            this.provinceCollection,
            {},
            { projection: { code: 1, name: 1, district: 1 } }
        )

        if (senderInfo.code) body.senderInfo.code = senderInfo.code
        document['senderInfo'] = this.includePositionName(provinces, senderInfo)
        document['receiverInfo'] = this.includePositionName(provinces, receiverInfo)

        const services = await this.find<Service>(this.serviceCollection, {})
        body.extraService?.forEach(s => {
            const service = services.find(service => service.code === s.code && service.isExtra)
            s['name'] = service?.name
            s['id'] = service._id
            s.price = s.price
        })
        if (body.mainService) {
            const service = services.find(service => service.code === body.mainService.code && !service.isExtra)
            body.mainService['name'] = service?.name
            body.mainService['id'] = service._id
            body.mainService.price = body['mainService'].price
        }
        if (body.inventory == InventoryUnit.DELIVER_MEMBER && deliverMember) {
            const user: User = await this.findOne(this.db.collection('user'), {
                code: deliverMember
            })
            document['deliverMember'] = {
                userId: user._id,
                name: user.name,
                code: user.code,
                unit: user.unit
            }
        }

        if (goodsInfo) document['goodsInfo'] = await this.includePackageName(goodsInfo)

        if (receiverInfo) document['receiveUnit'] = await this.includeUnitByPosition(provinces, receiverInfo)

        document['progress'] = await this.includeProgressName(progress)
        document['finance'] = await this.includeFinanceName(finance)
        document['unit'] = RequestHelper.getAuthUser().unit

        const result = await this.insertOne(this.collection, { ...body, ...document, discount, discountUnit })
        return result.ops[0] ? result.ops[0] : EMPTY_OBJECT
    }
    private async autoGenerateCode(): Promise<string> {
        const seq = await this.getNextSequence(CounterCodes.BILL_CODE)
        return `${this.getDate()}${seq.toString().padStart(4, '0')}`
    }

    getDate(timestamp?: number): string {
        const dt = timestamp ? new Date(timestamp) : new Date()
        return `${dt
            .getDate()
            .toString()
            .padStart(2, '0')}${(dt.getMonth() + 1).toString().padStart(2, '0')}${dt.getFullYear()}`
    }

    private includeUnitByPosition(provinces: Province[], userInfo: UserInfo): Unit {
        const { provinceCode, districtCode } = userInfo
        const province = provinces.find(p => p.code === provinceCode)
        const district = province.district?.find(d => d.code === districtCode)
        if (district) {
            return district.unit
        }
        return province.unit
    }

    private includePositionName(provinces: Province[], userInfo: UserInfo): UserInfo {
        const { provinceCode, districtCode } = userInfo
        const province = provinces.find(p => p.code === provinceCode)
        if (!province) throw new HttpException('Tỉnh/Thành không hợp lệ', HttpStatus.BAD_REQUEST)
        const district = province.district?.find(d => d.code === districtCode)
        if (!district) throw new HttpException('Quận/Huyện không hợp lệ', HttpStatus.BAD_REQUEST)
        userInfo['provinceName'] = province.name
        userInfo['districtName'] = district.name
        return userInfo
    }

    private async includePackageName(goodsInfo: GoodsInfo[]): Promise<GoodsInfo[]> {
        const packages = await this.find<Package>(this.packageCollection, {}, { projection: { code: 1, name: 1 } })
        goodsInfo?.forEach(g => {
            g['quantity'] = g['quantity'] || 1
            g['packageName'] = packages.find(pack => pack.code === g.package)?.name
        })
        return goodsInfo
    }

    private async includeProgressName(code: string): Promise<object> {
        return this.findOne<Progress>(this.progressCollection, { code }, { projection: { _id: 0, code: 1, name: 1 } })
    }

    private async includeFinanceName(code: string): Promise<object> {
        return this.findOne<Finance>(this.financeCollection, { code }, { projection: { _id: 0, code: 1, name: 1 } })
    }

    /**
     * edit bill
     * @param body
     * @param id
     * @return bill document
     */
    async edit(id: string, body: object): Promise<object> {
        const services = await this.serviceCollection.find({ deleteTime: this.eqCondition(null) }).toArray()
        body['extraService']?.forEach(s => {
            const service = services.find(service => service.code === s.code && service.isExtra)
            s.name = service?.name
            s.id = service._id
            s.price = s.price
        })
        if (body['mainService']) {
            const service = services.find(service => service.code === body['mainService'].code && !service.isExtra)
            body['mainService'].name = service?.name
            body['mainService'].id = service._id
            body['mainService'].price = body['mainService'].price
        }
        const packages = await this.packageCollection.find({ deleteTime: this.eqCondition(null) }).toArray()
        body['goodsInfo']?.forEach(g => {
            g.packageName = packages.find(pack => pack.code === g.package)?.name
            console.log('g.packageName', g.packageName)
        })
        const provinceAndDistrict = []
        const provinces = await this.provinceCollection.find({ deleteTime: this.eqCondition(null) }).toArray()
        provinces?.forEach(p => {
            p.district?.forEach(d => {
                provinceAndDistrict.push(d)
            })
            provinceAndDistrict.push(p)
        })
        if (body['senderInfo']) {
            body['senderInfo'].provinceName = provinceAndDistrict.find(
                p => p.code === body['senderInfo'].provinceCode
            )?.name
            body['senderInfo'].districtName = provinceAndDistrict.find(
                p => p.code === body['senderInfo'].districtCode
            )?.name
        }
        if (body['receiverInfo']) {
            body['receiverInfo'].provinceName = provinceAndDistrict.find(
                p => p.code === body['receiverInfo'].provinceCode
            )?.name
            body['receiverInfo'].districtName = provinceAndDistrict.find(
                p => p.code === body['receiverInfo'].districtCode
            )?.name

            body['receiveUnit'] = await this.includeUnitByPosition(provinces, body['receiverInfo'])
        }
        if (body['progress']) {
            const progresses = await this.progressCollection.find({ deleteTime: this.eqCondition(null) }).toArray()
            body['progress'] = {
                code: body['progress'],
                name: progresses.find(p => p.code === body['progress'])?.name
            }
        }

        if (body['finance']) {
            const finances = await this.financeCollection.find({ deleteTime: this.eqCondition(null) }).toArray()
            body['finance'] = {
                code: body['finance'],
                name: finances.find(p => p.code === body['finance'])?.name
            }
        }

        if (body['truck']) {
            const trucks = await this.truckCollection.find({ deleteTime: this.eqCondition(null) }).toArray()
            body['truck'] = {
                code: body['truck'],
                name: trucks.find(p => p.code === body['truck'])?.name
            }
        }
        if (body['inventory'] == InventoryUnit.DELIVER_MEMBER && body['deliverMember']) {
            const user: User = await this.findOne(this.db.collection('user'), {
                code: body['deliverMember']
            })
            body['deliverMember'] = {
                userId: user._id,
                name: user.name,
                code: user.code,
                unit: user.unit
            }
        }

        const result = await this.findOneAndUpdate(this.collection, { _id: new ObjectId(id) }, body)
        if (result.value) return result.value
        throw new HttpException('', HttpStatus.NO_CONTENT)
    }

    /**
     * delete bill
     * @param id
     * @return null
     */
    async delete(id: string): Promise<boolean> {
        const result = await this.deleteOne(this.collection, { _id: new ObjectId(id) })
        if (result.modifiedCount > 0) return null
        throw new HttpException('Vận đơn không tồn tại', HttpStatus.BAD_REQUEST)
    }

    private async generateExport(data: BillExport[]): Promise<object[]> {
        const packages = await this.find<Package>(this.packageCollection, {}, { projection: { code: 1, name: 1 } })
        // const extraServiceLengths = data.filter(x => x.extraService)?.map(x => x.extraService?.length) || [0]
        // const extraServiceMaxQuantity = Math.max(...extraServiceLengths)
        const xlsData = []
        for (const row of data) {
            const rowData = []
            const { total, extraService, discount, goodsInfo, senderInfo, receiverInfo, insertTime } = row
            rowData.push('')
            rowData.push(row.code || EMPTY_EXPORT)
            rowData.push(senderInfo ? senderInfo.code || EMPTY_EXPORT : EMPTY_EXPORT)
            rowData.push(senderInfo ? senderInfo.name || EMPTY_EXPORT : EMPTY_EXPORT)
            rowData.push(row.progress || EMPTY_EXPORT)
            rowData.push(row.finance || EMPTY_EXPORT)
            rowData.push(senderInfo ? senderInfo.provinceName || EMPTY_EXPORT : EMPTY_EXPORT)
            rowData.push(senderInfo ? senderInfo.districtName || EMPTY_EXPORT : EMPTY_EXPORT)
            rowData.push(receiverInfo ? receiverInfo.provinceName || EMPTY_EXPORT : EMPTY_EXPORT)
            rowData.push(receiverInfo ? receiverInfo.districtName || EMPTY_EXPORT : EMPTY_EXPORT)
            rowData.push(row.insertBy ? row.insertBy || EMPTY_EXPORT : EMPTY_EXPORT)
            rowData.push(row.deliverMember || EMPTY_EXPORT)
            rowData.push(this.getInventory(row.inventory))
            rowData.push(row.mainService || EMPTY_EXPORT)
            if (extraService?.length > 0) {
                for (let i = 0; i < 5; i++) {
                    rowData.push(EMPTY_EXPORT)
                    //rowData.push(extraService[i]?.name)
                }
            } else {
                for (let i = 0; i < 5; i++) {
                    rowData.push(EMPTY_EXPORT)
                }
            }
            rowData.push(`${this.numberWithCommas(row.weight) || EMPTY_EXPORT} ${this.getWeightUnit(row.weightUnit)}`)
            rowData.push((row.truck = row.truck || EMPTY_EXPORT))
            rowData.push(`${this.numberWithCommas(discount) || EMPTY_EXPORT} ${row.discountUnit === 1 ? PERCENT : VND}`)
            rowData.push(`${this.numberWithCommas(total) || EMPTY_EXPORT} ${VND}`)
            rowData.push(
                goodsInfo?.length > 0
                    ? goodsInfo
                          ?.map(
                              g =>
                                  `\u2022 ${g.quantity ? this.numberWithCommas(g.quantity) : '...'} ${packages?.find(
                                      x => x.code === g.package
                                  )?.name || '...'} : ${g.content || '...'}`
                          )
                          .join('\n')
                    : EMPTY_EXPORT
            )
            rowData.push(senderInfo ? senderInfo.address || EMPTY_EXPORT : EMPTY_EXPORT)
            rowData.push(receiverInfo ? senderInfo.name || EMPTY_EXPORT : EMPTY_EXPORT)
            rowData.push(receiverInfo ? senderInfo.address || EMPTY_EXPORT : EMPTY_EXPORT)
            rowData.push(insertTime ? timestampToDateStr(Number(insertTime / 1000), FORMAT_TIMESTAMP) : EMPTY_EXPORT)

            xlsData.push(rowData)
        }
        return xlsData
    }
    private getWeightUnit(unitKey: WeightUnit): string {
        switch (unitKey) {
            case WeightUnit.KILOGAM:
                return 'Kg'
            case WeightUnit.KHOI:
                return 'Khối'
            case WeightUnit.TAN:
                return 'Tấn'
            default:
                return ''
        }
    }
    private getInventory(inventoryKey: InventoryUnit): string {
        switch (inventoryKey) {
            case InventoryUnit.SEND:
                return 'Tồn ở đơn vị chuyển'
            case InventoryUnit.RECEIVE:
                return 'Tồn ở đơn vị phát'
            case InventoryUnit.DELIVER_MEMBER:
                return 'Tồn ở nhân viên phát'
            case InventoryUnit.FINISH:
                return 'Kết thúc (thành công hoặc đóng trả)'
            default:
                return EMPTY_EXPORT
        }
    }

    async import(body: BillImportValidator): Promise<boolean> {
        const { senderInfo, items } = body
        const [provinces, services] = await Promise.all([
            this.find<Province>(this.provinceCollection, {}, { projection: { code: 1, name: 1, district: 1 } }),
            this.find<Service>(this.serviceCollection, {})
        ])
        const bills: Bill[] = []

        for await (const item of items) {
            const bill: any = {}
            const { code, extraService, goodsInfo, mainService, receiverInfo, weight, progress, finance, total } = item

            bill.code = code || (await this.autoGenerateCode())
            bill.senderInfo = this.includePositionName(provinces, senderInfo)
            bill.receiverInfo = this.includePositionName(provinces, receiverInfo)

            extraService?.forEach(s => {
                const service = services.find(service => service.code === s.code && service.isExtra)
                s['name'] = service?.name
                s['id'] = service._id
            })
            if (mainService) {
                const service = services.find(service => service.code === mainService.code && !service.isExtra)
                mainService['name'] = service?.name
                mainService['id'] = service._id
                bill.mainService = mainService
            }
            if (goodsInfo) bill.goodsInfo = await this.includePackageName(goodsInfo)
            if (weight) bill.weight = weight
            bill.progress = await this.includeProgressName(progress)
            bill.finance = await this.includeFinanceName(finance)
            bill.total = total

            const currentTime = new Date().getTime()
            const user = RequestHelper.getAuthUser()
            const insertBy = user ? { userId: new ObjectId(user.userId), username: user.username, name: user.name } : {}

            bills.push({ ...bill, insertBy, insertTime: currentTime, updateTime: currentTime })
        }
        const result = await this.collection.insertMany(bills)
        return result.insertedCount > 0
    }

    async export(query: BillSearch): Promise<Buffer> {
        const matchFilter = this.getFilter(query)
        const projection = this.projectionExport()
        const result = await this.find<BillExport>(this.collection, matchFilter, {
            sort: { updateTime: -1 },
            projection
        })
        if (result.length === 0) return null
        const bills = await this.generateExport(result)
        if (bills.length === 0) return null
        return this.exportService.generateExport(bills)
    }

    private numberWithCommas(num = 0): string {
        return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    private projectionExport(): object {
        return {
            _id: 0,
            code: 1,
            discount: 1,
            discountUnit: 1,
            weight: 1,
            weightUnit: 1,
            total: 1,
            insertTime: 1,
            goodsInfo: 1,
            extraService: 1,
            senderInfo: 1,
            receiverInfo: 1,
            inventory: 1,
            deliverMember: '$deliverMember.name',
            mainService: '$mainService.name',
            progress: '$progress.name',
            finance: '$finance.name',
            truck: '$truck.name',
            insertBy: '$insertBy.name'
        }
    }

    private projectionGetAll(): object {
        return {
            code: 1,
            'senderInfo.code': 1,
            'senderInfo.name': 1,
            'mainService.code': 1,
            'mainService.name': 1,
            progress: 1,
            finance: 1,
            total: 1,
            insertBy: 1,
            insertTime: 1,
            sendUnit: 1
        }
    }
}
