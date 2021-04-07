import { HttpException, HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { ObjectId } from 'mongodb'
import { Domain } from 'src/domain/domain.interface'
import { extractHostname, isNullOrUndefined, isTrue, isUndefined, parseMongoId } from 'src/share/common'
import { CollectionList, LANG_VI } from 'src/share/constants/collection.constant'
import { RequestHelper } from 'src/share/helpers/request.helper'
import { BaseService, emptyFacet, Facet } from 'src/share/service/base.service'
import { toSlug } from 'src/share/utils/string.util'
import { WinstonLogger } from 'src/winston/winston.classes'
import { InjectLogger } from 'src/winston/winston.decorators'
import { $CATEGORY } from './post.constant'
import { Post } from './post.interface'
import { PostQuery, PostValidator } from './post.validator'

/**
 * Post Service
 * @author KhoaVD
 */

@Injectable()
export class PostService extends BaseService<Post> {
    constructor(@InjectLogger(CollectionList.POST_COLLECTION) private readonly postLogger: WinstonLogger) {
        super(postLogger)
        this.postLogger.setContext(this.constructor.name)
    }

    async getAll(query?: PostQuery): Promise<Facet> {
        const { page, language = LANG_VI, max } = query
        const collectionName = this.getCollectionName(language)
        const collection = this.db.collection(collectionName)

        const pipeLine: object[] = await this.buildFindAll(query)
        pipeLine.push(
            this.sortOperator({ insertTime: -1 }),
            this.lookupStage({
                from: 'category',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category'
            }),
            this.lookupStage({
                from: 'domain',
                localField: 'domainIds',
                foreignField: '_id',
                as: 'domains'
            }),
            this.unwindStage({ path: '$category', preserveNullAndEmptyArrays: true }),
            this.projectStage(this.projectionGetAll())
        )
        const result = await this.aggregate(collection, pipeLine, page, max)
        return result.length > 0 ? result[0] : emptyFacet()
    }

    private async buildFindAll(query: PostQuery): Promise<object[]> {
        const { categoryId, isShow, title, tag, domainId } = query
        const pipeline: object[] = []
        const matchFilter = {}
        if (!isNullOrUndefined(isShow)) matchFilter['isShow'] = isTrue(isShow)
        if (!isNullOrUndefined(categoryId)) matchFilter['categoryId'] = new ObjectId(categoryId)
        if (!isNullOrUndefined(title)) matchFilter['$text'] = { $search: title }
        if (!isNullOrUndefined(tag)) {
            matchFilter['tagSlug'] = toSlug(tag)
        }
        if (!isNullOrUndefined(domainId)) {
            Object.assign(matchFilter, await this.getFilterByDomainCondition(domainId))
        }
        pipeline.push(this.matchStage(matchFilter))
        return pipeline
    }

    private async getFilterByDomainCondition(domainId: string): Promise<object> {
        const domain = await this.db
            .collection(CollectionList.DOMAIN_COLLECTION)
            .findOne<Domain>(this.notDeleted({ _id: new ObjectId(domainId) }))
        if (domain) {
            return this.orOperator<Post>({ domainIds: domain._id })
        }
        return {}
    }

    async getDetail(id: string, language = LANG_VI): Promise<object> {
        const collectionName = this.getCollectionName(language)
        const collection = this.db.collection(collectionName)
        const pipeLine: object[] = []
        pipeLine.push(
            this.matchStage({ _id: new ObjectId(id) }),
            this.lookupStage({
                from: 'category',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category'
            }),
            this.lookupStage({
                from: 'domain',
                localField: 'domainIds',
                foreignField: '_id',
                as: 'domains'
            }),
            this.unwindStage({ path: $CATEGORY, preserveNullAndEmptyArrays: true }),
            this.projectStage(this.projectionDetail())
        )
        const result = await collection.aggregate(pipeLine).toArray()
        if (result.length > 0) return result[0]
        throw new HttpException('', HttpStatus.NO_CONTENT)
    }

    async create(body: PostValidator): Promise<object> {
        const { title, isShow = true, categoryId, tag, ...postData } = body
        const _id = new ObjectId()
        const postCollections: string[] = (await this.db.listCollections().toArray())
            .map(x => x.name)
            .filter(x => x.indexOf('post_') !== -1)
        const slug = await this.genSlug(this.db.collection('post_vi'), title)
        const tagSlug = tag?.split(',').map(t => {
            return toSlug(t)
        })
        const data = { _id, title, slug, isShow, tagSlug, tag, ...postData }
        if (categoryId) data['categoryId'] = new ObjectId(categoryId)
        const [result] = await Promise.all(
            postCollections.map(x => this.insertOne(this.db.collection(x), { ...data, lang: x.slice(5) }))
        )
        if (result.ops) return result.ops[0]
        throw new UnprocessableEntityException()
    }

    async edit(id: string, body: PostValidator, language = LANG_VI): Promise<object> {
        const collection = this.db.collection<Post>(this.getCollectionName(language))
        const query = {}
        if (!isNullOrUndefined(body.title)) query['title'] = body.title
        if (!isNullOrUndefined(body.description)) query['description'] = body.description
        if (!isUndefined(body.seo)) query['seo'] = body.seo
        if (!isNullOrUndefined(body.content)) query['content'] = body.content
        if (!isUndefined(body.thumbnail)) query['thumbnail'] = body.thumbnail
        if (!isUndefined(body.images)) query['images'] = body.images
        if (!isUndefined(body.tag)) {
            query['tag'] = body.tag
            query['tagSlug'] = body.tag.split(',').map(t => {
                return toSlug(t)
            })
        }
        if (!isNullOrUndefined(body.isShow)) query['isShow'] = body.isShow
        if (!isNullOrUndefined(body.categoryId)) query['categoryId'] = new ObjectId(body.categoryId)
        if (!isNullOrUndefined(body.domainIds)) query['domainIds'] = parseMongoId(body.domainIds)

        const result = await this.findOneAndUpdate(collection, { _id: new ObjectId(id) }, query)
        if (result.value) return result.value
        throw new HttpException('', HttpStatus.NO_CONTENT)
    }

    async delete(id: ObjectId): Promise<null> {
        const postCollections = (await this.db.listCollections().toArray())
            .map(x => x.name)
            .filter(x => x.indexOf('post_') !== -1)
        const [deletePost] = await Promise.all(
            postCollections.map(x => this.deleteOne(this.db.collection(x), { _id: new ObjectId(id) }))
        )
        if (deletePost.modifiedCount > 0) return null
        throw new HttpException('bài viết không tồn tại', HttpStatus.BAD_REQUEST)
    }

    public getCollectionName(language: string): string {
        return `${CollectionList.POST_COLLECTION}_${language}`
    }

    private projectionGetAll(): object {
        return {
            id: 1,
            title: 1,
            category: { id: '$category._id', name: 1 },
            order: 1,
            isShow: 1,
            thumbnail: 1,
            insertTime: 1,
            insertBy: 1,
            tag: 1,
            slug: 1,
            domains: { id: '$_id', name: 1 },
            description: 1
        }
    }

    private projectionDetail(): object {
        return {
            title: 1,
            description: 1,
            slug: 1,
            isShow: 1,
            order: 1,
            content: 1,
            thumbnail: 1,
            images: 1,
            tag: 1,
            seo: 1,
            domainIds: 1,
            insertBy: 1,
            insertTime: 1,
            category: { id: '$categoryId', name: 1, slug: 1 },
            domains: { id: '$_id', name: 1 },
            lang: 1
        }
    }
}
