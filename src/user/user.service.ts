import { HttpException, HttpStatus, Inject, Injectable, UnprocessableEntityException } from '@nestjs/common'
import * as bcryptjs from 'bcryptjs'
import { Collection, ObjectId } from 'mongodb'
import { isNullOrUndefined, isObjectEmpty, isUndefined } from 'src/share/common'
import { CollectionList } from 'src/share/constants/collection.constant'
import { BaseService, emptyFacet, Facet } from 'src/share/service/base.service'
import { removeNotNumber, removeVietnameseTones } from 'src/share/utils/string.util'
import { Unit } from 'src/unit/unit.interface'
import { WinstonLogger } from 'src/winston/winston.classes'
import { InjectLogger } from 'src/winston/winston.decorators'
import { ADMIN, DEFAULT_PASSWORD, MANAGER, Role } from './user.constant'
import { User } from './user.interface'
import { InsertUserValidator, UserQuery, UserValidator } from './user.validator'

/**
 * User Service
 * @author KhoaVD
 */
@Injectable()
export class UserService extends BaseService<User> {
    constructor(
        @Inject(CollectionList.USER_COLLECTION) private collection: Collection<User>,
        @Inject(CollectionList.UNIT_COLLECTION) private unitCollection: Collection<Unit>,
        @InjectLogger(CollectionList.USER_COLLECTION) private readonly userLogger: WinstonLogger
    ) {
        super(userLogger)
        this.userLogger.setContext(this.constructor.name)
    }

    async create(body: InsertUserValidator): Promise<object> {
        const hash = bcryptjs.hashSync(DEFAULT_PASSWORD, bcryptjs.genSaltSync(10))
        const code = await this.autoGenerateCode()
        const nameSearch = removeVietnameseTones(body.name)
        const telSearch = removeNotNumber(body.tel)
        const data = {
            username: body.username,
            role: body.role,
            name: body.name,
            tel: body.tel,
            birthday: body.birthday,
            address: body.address,
            email: body.email,
            code,
            nameSearch,
            telSearch,
            password: hash
        }
        if (body.role !== ADMIN) {
            const unit = await this.findOne(this.unitCollection, { code: body.unit })
            if (isObjectEmpty(unit)) throw new HttpException('Đơn vị không đúng.', HttpStatus.BAD_REQUEST)
            data['unit'] = { code: body.unit, name: unit.name }
        }
        const result = await this.insertOne(this.collection, data)
        if (result.ops[0]) {
            delete result.ops[0].password
            return result.ops[0]
        }
        throw new UnprocessableEntityException()
    }

    async getAll(query?: UserQuery): Promise<Facet> {
        if (query.dropdown) {
            const userList = await this.find(this.collection, {}, { projection: { id: 1, name: 1, unit: 1 } })
            return { data: userList, totalRecords: userList.length }
        }
        let result
        if (query.unitCode) {
            result = await this.find(
                this.collection,
                { 'unit.code': query.unitCode },
                { projection: { code: 1, name: 1 } }
            )
            return { data: result, totalRecords: result.length }
        }
        const pipeLine: object[] = this.buildFindAllPipeline(query)
        result = await this.aggregate(this.collection, pipeLine, query.page)
        return result.length > 0 ? result[0] : emptyFacet()
    }

    private buildFindAllPipeline(query: UserQuery): object[] {
        const { username, role, email, tel, name, unitCode } = query
        const pipeline: object[] = []
        const matchFilter = {}
        if (!isNullOrUndefined(username)) matchFilter['username'] = new RegExp('.*' + username + '.*')
        if (!isNullOrUndefined(name)) matchFilter['$text'] = { $search: removeVietnameseTones(name) }
        if (!isNullOrUndefined(role)) matchFilter['role'] = role
        if (!isNullOrUndefined(email)) matchFilter['email'] = new RegExp('.*' + email + '.*')
        if (!isNullOrUndefined(tel)) matchFilter['tel'] = new RegExp('.*' + tel + '.*')
        if (!isNullOrUndefined(unitCode)) matchFilter['unit.code'] = unitCode
        pipeline.push(this.matchStage(matchFilter), this.sortOperator({ updateTime: -1 }))
        pipeline.push(this.projectStage({ password: 0 }))
        return pipeline
    }

    async getDetail(id: string): Promise<object> {
        const result = await this.findOne(this.collection, { _id: new ObjectId(id) })
        result['bills'] = await this.find(
            this.db.collection('bill'),
            this.orOperator(
                {
                    'insertBy.userId': new ObjectId(id)
                },
                {
                    'deliverMember.id': new ObjectId(id)
                }
            )
        )
        if (result) {
            delete result.password
            return result
        }
        throw new HttpException('', HttpStatus.NO_CONTENT)
    }

    async edit(id: string, body: UserValidator, role: Role): Promise<object> {
        const document = {}
        if (!isNullOrUndefined(body.name) && (role === ADMIN || role === MANAGER)) {
            document['name'] = body.name
            document['nameSearch'] = removeVietnameseTones(body.name)
        }
        if (!isUndefined(body.tel)) {
            document['tel'] = body.tel
            document['telSearch'] = removeNotNumber(body.tel)
        }
        if (!isUndefined(body.birthday)) document['birthday'] = body.birthday
        if (!isUndefined(body.address)) document['address'] = body.address
        if (!isUndefined(body.email)) document['email'] = body.email
        if (!isNullOrUndefined(body.unit) && role === ADMIN) {
            const unit = await this.findOne(this.unitCollection, { code: body.unit })
            if (isObjectEmpty(unit)) throw new HttpException('Đơn vị không đúng.', HttpStatus.BAD_REQUEST)
            document['unit'] = { code: unit.code, name: unit.name }
        }
        const result = await this.findOneAndUpdate(this.collection, { _id: new ObjectId(id) }, document)
        if (result.value) return result.value
        throw new HttpException('', HttpStatus.NO_CONTENT)
    }

    async delete(id: string): Promise<null> {
        const deleteUser = await this.deleteOne(this.collection, { _id: new ObjectId(id) })
        if (deleteUser.modifiedCount > 0) return null
        throw new HttpException('user không tồn tại', HttpStatus.BAD_REQUEST)
    }

    private async autoGenerateCode(): Promise<string> {
        const num = await this.getNextSequence('usercode')
        const code = '0000' + num
        return `NV${code.slice(-4)}`
    }
}
