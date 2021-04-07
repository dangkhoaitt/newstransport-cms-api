import { Inject } from '@nestjs/common'
import {
    Collection,
    Db,
    FilterQuery,
    FindAndModifyWriteOpResultObject,
    FindOneOptions,
    InsertOneWriteOpResult,
    ObjectId,
    QuerySelector,
    UpdateWriteOpResult
} from 'mongodb'
import { AuthUser } from 'src/auth/interfaces/auth-user.interface'
import { WinstonLogger } from 'src/winston/winston.classes'
import { removeUndefinedProperty } from '../common'
import { DEFAULT_MAX_RECORD, DEFAULT_PAGE, EMPTY_LIST } from '../constants/app-constant'
import { CollectionList } from '../constants/collection.constant'
import {
    $TOTAL_RECORDS,
    $TOTAL_RECORDS_TOTAL_RECORDS,
    MONGODB_PROVIDER,
    TOTAL_RECORDS
} from '../constants/mongodb.constant'
import { RequestHelper } from '../helpers/request.helper'
import { BaseInterface, UpdateHistory } from '../interfaces/base.interface'
import { randomNumber, toSlug } from '../utils/string.util'

export type Facet = { data: object[]; totalRecords: number }

export function emptyFacet(): Facet {
    return { data: EMPTY_LIST, totalRecords: 0 }
}

export class BaseService<TSchema extends BaseInterface> {
    @Inject(MONGODB_PROVIDER) protected db: Db

    private logger: WinstonLogger
    protected LIMIT = 10

    constructor(logger: WinstonLogger) {
        this.logger = logger
    }

    /**
     * This function is used to build query filter by Id
     * @param id
     * @returns { _id: ObjectId(id), deleteTime: { $eq: null }}
     */
    protected buildFilterId(id: string): object {
        return { _id: new ObjectId(id), deleteTime: { $eq: null } }
    }

    /**
     * This function is used to build query filter with deleteTime : null
     * @param filter
     * @returns { filter , deleteTime: null}}
     */
    protected notDeleted(filter: object): object {
        return { ...filter, deleteTime: null }
    }

    /**
     * This function is used to build updateQuery or set stage for aggregation operator
     * @param update
     * @returns { $set: update }
     */
    protected setStage(update: object): object {
        return { $set: update }
    }

    /**
     * This function is used to build match stage for aggregation operator.
     * @param filter
     * @returns `{ $match: filter }`
     */
    protected matchStage(filter: object): object {
        return { $match: { ...filter, deleteTime: this.eqCondition(null) } }
    }

    /**
     * This function is used to build graphLookup stage for aggregation operator
     * @param lookup
     * @returns `{ $graphLookup: lookup }`
     */
    protected graphLookupStage(lookup: object): object {
        return { $graphLookup: lookup }
    }

    /**
     * This function is used to build lookup stage for aggregation operator.
     * @param lookup
     * @returns `{ $lookup: lookup }`
     */
    protected lookupStage(lookup: object): object {
        return { $lookup: lookup }
    }

    /**
     * This function is used to build $project stage for aggregation operator.
     * @param project
     * @returns `{ $project: project }`
     */
    protected projectStage(project: object): object {
        return { $project: project }
    }

    /**
     * This function is used to build $sort stage for aggregation operator.
     * @param sort
     * @returns `{ $sort: sort }`
     */
    protected sortStage(sort: object): object {
        return { $sort: sort }
    }

    /**
     * This function is used to build $skip stage for aggregation operator.
     * @param skip
     * @returns `{ $skip: skip }`
     */
    protected skipStage(skip: number): object {
        return { $skip: skip }
    }

    /**
     * This function is used to build $limit stage for aggregation operator.
     * @param limit
     * @returns `{ $limit: limit }`
     */
    protected limitStage(limit: number): object {
        return { $limit: limit }
    }

    /**
     * This function is used to build `$addFields` stage for aggregation operator.
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/aggregation/addFields/)
     * @param fields
     * @returns `{ $addFields: fields }`
     */
    protected addFieldsStage(fields: object): object {
        return { $addFields: fields }
    }

    /**
     * This function is used to build `$count` stage for aggregation operator.
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/aggregation/count/)
     * @param fieldName
     * @returns `{ $count: fieldName }`
     */
    protected countStage(fieldName: string): object {
        return { $count: fieldName }
    }

    /**
     * This function is used to build `$facet` stage for aggregation operator.
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/aggregation/facet/)
     * @param pipelines
     * @returns `{ $facet: pipelines }`
     */
    protected facetStage(pipelines: object): object {
        return { $facet: pipelines }
    }

    /**
     * This function is used to build `$unwind` stage for aggregation operator.
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/aggregation/unwind/)
     * @param unwind
     * @returns `{ $unwind: unwind }`
     */
    protected unwindStage(unwind: string | object): object {
        return { $unwind: unwind }
    }

    /**
     * This function is used to build $arrayElemAt operator for aggregation
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/aggregation/arrayElemAt/)
     * @param array
     * @param index
     * @returns `{ $arrayElemAt: [array, index] }`
     */
    protected arrayElemAt(array: object[] | string, index: number): object {
        return { $arrayElemAt: [array, index] }
    }

    /**
     * This function is used to build $ifNull operator for aggregation
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/aggregation/ifNull/)
     * @param expression
     * @param replacement
     * @returns `{ $ifNull: [expression, replacement] }`
     */
    protected ifNull(expression: string | object, replacement: object): object {
        return { $ifNull: [expression, replacement] }
    }

    /**
     * This function is used to build $eq operator for aggregation pipeline operator.
     * @param param1
     * @param param2
     * @returns `{ $eq: [param1, param2] }`
     */
    protected eqOperator<T, S>(param1: T, param2: S): object {
        return { $eq: [param1, param2] }
    }

    /**
     * This function used to build specifies equality condition via  $eq operator
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/query/eq/index.html)
     * @param expression
     */
    protected eqCondition(value: string | number | ObjectId): object {
        return { $eq: value }
    }

    /**
     * This function used to build not equal to the specified value condition via  $ne operator
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/query/ne/index.html)
     * @param expression
     */
    protected neCondition(value: string | number | ObjectId): object {
        return { $ne: value }
    }

    /**
     * This function is used to build $and operator for aggregation pipeline operator.
     * @param filters
     * @returns `{ $and: [...filters] }`
     */
    protected andOperator(...filters: object[]): object {
        return { $and: [...filters] }
    }

    /**
     * This function is used to build $or operator for aggregation pipeline operator.
     * @param expressions
     * @returns `{ $or: [...expressions] }`
     */
    protected orOperator<T>(...expressions: Array<FilterQuery<T>>): object {
        return { $or: [...expressions] }
    }

    /**
     * This function is used to build $expr operator for aggregation pipeline operator.
     * @param filter
     * @returns `{ $expr: filter }`
     */
    protected exprOperator(filter: object): object {
        return { $expr: filter }
    }

    /**
     * This function is used to build $size operator for aggregation pipeline operator.
     * @param parram
     * @returns `{ $size: parram }`
     */
    protected sizeOperator(parram: string | object): object {
        return { $size: parram }
    }

    /**
     * This function is used to build `$toDate` operator for aggregation pipeline operator.
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/aggregation/toDate/)
     * @param expression
     * @returns `{ $toDate: expression }`
     */
    protected toDateOperator(expression: string | number | ObjectId): object {
        return { $toDate: expression }
    }

    /**
     * This function is used to build text search operator.
     * @param text
     * @returns  `{ $text: { $search: text } }`
     */
    protected textSearchOperator(text: string): object {
        return { $text: { $search: text } }
    }

    /**
     * This function is used to build `$gte` operator for aggregation pipeline operator.
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/aggregation/gte/)
     * @param expression
     * @returns `{ $gte: expression }`
     */
    protected gteOperator<T>(expression: T): object {
        return { $gte: expression }
    }

    /**
     * This function is used to build `$lte` operator for aggregation pipeline operator.
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/aggregation/lte/)
     * @param expression
     * @returns `{ $lte: expression }`
     */
    protected lteOperator<T>(expression: T): object {
        return { $lte: expression }
    }

    /**
     * This function is used to build `$elemMatch` operator for aggregation pipeline operator.
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/query/elemMatch/)
     * @param query
     * @returns `{ $elemMatch: query }`
     */
    protected elemMatchOperator(query: object): object {
        return { $elemMatch: query }
    }

    /**
     * This function is used to build `$exists` operator for aggregation pipeline operator.
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/query/exists/)
     * @param isExists
     * @returns `{ $exists: isExists }`
     */
    protected existsOperator(isExists: boolean): object {
        return { $exists: isExists }
    }

    /**
     * This function used to build `$in` operator for aggregation pipeline operator
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/query/in/)
     * @param array
     * @returns `{ $in: array }`
     */
    protected inOperator(array: Array<unknown>): object {
        return { $in: array }
    }

    /**
     * This function used to build `$nin` operator for aggregation pipeline operator
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/query/nin/)
     * @param array
     * @returns `{ $in: array }`
     */
    protected ninOperator(array: Array<unknown>): object {
        return { $nin: array }
    }

    /**
     * This function used to build `$all` operator for aggregation pipeline operator
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/query/all/)
     * @param array
     * @returns `{ $all: array }`
     */
    protected allOperator(array: Array<unknown>): object {
        return { $all: array }
    }
    /**
     * This function used to build `$pull` operator.This operator removes from an existing array
     * all instances of a value or values that match a specified condition.
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/update/pull/)
     * @param object
     */
    protected pullOperator(object: object): object {
        return { $pull: object }
    }

    /**
     * This function used to build `$push` operator.This operator appends a specified value to an array.
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/update/push/)
     * @param object
     */
    protected pushOperator(object: object): object {
        return { $push: object }
    }

    /**
     * This function used to build `$filter` operator for aggregation pipeline operator
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/aggregation/filter/)
     * @param input
     * @param as
     * @param cond
     * @returns `{ $filter: { input, as, cond }`
     */
    protected filterOperator(input: string, as: string, cond: object): object {
        return { $filter: { input, as, cond } }
    }

    /**
     * This function used to build `$not` operator for logical query operator
     * @see [Request document](https://docs.mongodb.com/manual/reference/operator/query/not/)
     *
     * @param expression
     * @returns `{ $not: expression }`
     */
    protected notOperator<T>(expression: T extends string ? QuerySelector<T> | RegExp : QuerySelector<T>): object {
        return { $not: expression }
    }

    /**
     * This function is used to build `$sort` operator
     * @param options
     *
     * return `{ $sort: options }`
     */
    protected sortOperator(options: Record<string, unknown>): object {
        return { $sort: options }
    }

    /**
     * This function is used to build `$inc` operator
     * @param options
     * https://docs.mongodb.com/manual/reference/operator/update/inc/
     * return `{ $inc: options }`
     */
    protected incOperator(options: Record<string, number>): object {
        return { $inc: options }
    }

    /**
     * This function is used to build updateQuery for update document and store update history
     * @param data
     * @param updateUserId
     */
    protected buildUpdateWithHistory<T extends object>(data: T, updateBy: string): object {
        const update = this.setStage(data)
        const updateById = new ObjectId(updateBy)
        const updateHistory = this.buildUpdateHistory(data, updateById)
        update['$push'] = {
            updateHistory
        }
        return update
    }

    /**
     * This function used to build history log
     * @param data
     * @param updateBy
     */
    protected buildUpdateHistory<T extends object>(
        changedData: T,
        updateBy: ObjectId | Partial<AuthUser>
    ): UpdateHistory {
        const updateHistory: UpdateHistory = { changedData, updateBy }
        return updateHistory
    }

    protected async genSlug(collection: Collection, str: string): Promise<string> {
        let slug = toSlug(str)
        while ((await collection.countDocuments({ slug })) > 0) {
            const num = randomNumber(1, 9).toString()
            slug = `${slug}-${num}`
        }
        return slug
    }

    /**
     * This function used to build insert with insertOne
     * @param collection
     * @param document
     * @returns Promise<InsertOneWriteOpResult<TSchema>>
     */
    protected insertOne(collection: Collection, document: object): Promise<InsertOneWriteOpResult<TSchema>> {
        removeUndefinedProperty(document)
        const currentTime = new Date().getTime()
        const user = RequestHelper.getAuthUser()
        let insertBy = {}
        if (user) {
            const { userId, username, name } = user
            insertBy = { userId: new ObjectId(userId), username, name }
        }
        const data = { ...document, insertBy, insertTime: currentTime, updateTime: currentTime }
        this.logger.log('insert', data)
        return collection.insertOne(data)
    }

    /**
     * This function used to build update with updateOne
     * @param collection
     * @param filterQuery
     * @param document
     * @returns Promise<UpdateWriteOpResult>
     */
    protected updateOne(
        collection: Collection,
        filterQuery: FilterQuery<TSchema>,
        document: Partial<TSchema>
    ): Promise<UpdateWriteOpResult> {
        const updateTime = new Date().getTime()
        this.logger.log('update', { ...document, updateTime })
        return collection.updateOne(
            { ...filterQuery, deleteTime: this.eqCondition(null) },
            { $set: { ...document, updateTime } }
        )
    }

    protected findOneAndUpdate(
        collection: Collection,
        filterQuery: FilterQuery<TSchema>,
        document: Partial<TSchema>
    ): Promise<FindAndModifyWriteOpResultObject<TSchema>> {
        const updateTime = new Date().getTime()
        this.logger.log('update', { ...document, updateTime })
        return collection.findOneAndUpdate(
            { ...filterQuery, deleteTime: this.eqCondition(null) },
            { $set: { ...document, updateTime } },
            { returnOriginal: false }
        )
    }

    /**
     * This function used to build get all with find
     * @param collection
     * @returns Promise<Array<T>>
     */
    protected find<T = TSchema>(
        collection: Collection,
        filterQuery: object,
        options?: FindOneOptions<any>
    ): Promise<Array<T>> {
        const filter = { ...filterQuery, deleteTime: this.eqCondition(null) }
        this.logger.log('findAll', { filter })
        return collection.find(filter, options).toArray()
    }

    /**
     * This function used to build get all with aggregate
     * @param collection
     * @param pipeline
     * @param page
     * @returns Promise<Array<Facet>>
     */
    protected aggregate(
        collection: Collection,
        pipeline: object[],
        page: number = DEFAULT_PAGE,
        maxRecord: string = DEFAULT_MAX_RECORD
    ): Promise<Array<Facet>> {
        pipeline.push(
            this.facetStage({
                data: [this.skipStage((page - 1) * parseInt(maxRecord)), this.limitStage(parseInt(maxRecord))],
                totalRecords: [this.countStage(TOTAL_RECORDS)]
            }),
            this.unwindStage({ path: $TOTAL_RECORDS }),
            this.addFieldsStage({ totalRecords: $TOTAL_RECORDS_TOTAL_RECORDS })
        )
        this.logger.log('findAll', { pipeline })
        return collection.aggregate<Facet>(pipeline).toArray()
    }

    /**
     * This function used to build get one findOne
     * @param collection
     * @param filterQuery
     * @param options
     * @returns Promise<T>
     */
    protected findOne<T = TSchema>(collection: Collection, filterQuery: object, options?: object): Promise<T> {
        const filter = { ...filterQuery, deleteTime: this.eqCondition(null) }
        this.logger.log('findOne', { filter })
        return collection.findOne(filter, options)
    }

    /**
     * This function used to build delete API
     * @param collection
     * @param filterQuery
     * @param document
     * @returns Promise<UpdateWriteOpResult>
     */
    protected deleteOne(collection: Collection, filterQuery: FilterQuery<TSchema>): Promise<UpdateWriteOpResult> {
        const deleteTime = new Date().getTime()
        const { userId, username } = RequestHelper.getAuthUser()
        const deleteBy = { userId, username }
        const data = { deleteTime, deleteBy }
        this.logger.log('delete', { ...data })
        return collection.updateOne({ ...filterQuery, deleteTime: this.eqCondition(null) }, this.setStage(data))
    }

    /**
     * This function is check field exists
     * @param collection
     * @param filterQuery
     * @returns Promise<boolean>
     */
    protected async isExists(collection: Collection, filterQuery: FilterQuery<TSchema>): Promise<boolean> {
        const result = await collection.countDocuments({ ...filterQuery, deleteTime: this.eqCondition(null) })
        return result > 0
    }

    /**
     * This function is create code auto increment for collections
     * @param code
     */
    protected async getNextSequence(code: string, seq = 1): Promise<number> {
        const ret = await this.db
            .collection(CollectionList.COUNTER_COLLECTION)
            .findOneAndUpdate({ code }, this.incOperator({ seq }), { returnOriginal: true })
        if (ret.value) return ret.value.seq

        await this.db.collection(CollectionList.COUNTER_COLLECTION).insertOne({ code, seq })
        return seq
    }

    /**
     * @param code
     */
    protected async getOrder(code: string): Promise<object> {
        return await this.db
            .collection(CollectionList.ORDER_COLLECTION)
            .findOne({ code, deleteTime: this.eqCondition(null) })
    }

    /**
     * @param code
     */
    protected async updateOrder(code: string, id: string, order: number): Promise<object> {
        const orderIndex = order ? order - 1 : 0
        const orderDoc = await this.getOrder(code)
        if (orderDoc) {
            const index = orderDoc['idList'].indexOf(id)
            if (index != -1) orderDoc['idList'].splice(index, 1)
            orderDoc['idList'].splice(orderIndex, 0, id)
            return await this.db
                .collection(CollectionList.ORDER_COLLECTION)
                .updateOne({ code, deleteTime: this.eqCondition(null) }, { $set: { idList: orderDoc['idList'] } })
        } else {
            return await this.db.collection(CollectionList.ORDER_COLLECTION).insertOne({ code, idList: [id] })
        }
    }

    /**
     * @param code
     */
    protected async insertOrder(code: string, id: string, order: number): Promise<object> {
        const orderIndex = order ? order - 1 : 0
        const orderDoc = await this.getOrder(code)
        if (orderDoc) {
            orderDoc['idList'].splice(orderIndex, 0, id)
            return await this.db
                .collection(CollectionList.ORDER_COLLECTION)
                .updateOne({ code, deleteTime: this.eqCondition(null) }, { $set: { idList: orderDoc['idList'] } })
        } else {
            return await this.db.collection(CollectionList.ORDER_COLLECTION).insertOne({ code, idList: [id] })
        }
    }

    /**
     * @param code
     */
    protected async deleteOrder(code: string, id: string): Promise<object> {
        return await this.db
            .collection(CollectionList.ORDER_COLLECTION)
            .updateOne({ code, deleteTime: this.eqCondition(null) }, { $pull: { idList: id } })
    }

    /**
     * @param code
     */
    protected async includeOrder(objectArr: object[], code: string): Promise<object[]> {
        const resultArr = [...objectArr]
        const order = await this.getOrder(code)
        resultArr.forEach(o => {
            o['order'] =
                order?.['idList'].indexOf(o['_id']?.toString()) + 1 ||
                order?.['idList'].indexOf(o['id']?.toString()) + 1 ||
                o['order']
        })
        resultArr.sort((a, b) => {
            return a['order'] - b['order']
        })
        return resultArr
    }
}
