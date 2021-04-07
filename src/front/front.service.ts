import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { Collection, ObjectId } from 'mongodb'
import { Banner } from 'src/banner/banner.interface'
import { Bill } from 'src/bill/bill.interface'
import { Category } from 'src/category/category.interface'
import { Domain } from 'src/domain/domain.interface'
import { $CATEGORY } from 'src/post/post.constant'
import { Post } from 'src/post/post.interface'
import { PostQuery } from 'src/post/post.validator'
import { Progress } from 'src/progress/progress.interface'
import { Quote } from 'src/quote/quote.interface'
import { extractHostname, isNullOrUndefined } from 'src/share/common'
import { EMPTY_OBJECT, FRONT_KEY_LOGGER } from 'src/share/constants/app-constant'
import { CollectionList, LANG_VI, OrderCodes } from 'src/share/constants/collection.constant'
import { RequestHelper } from 'src/share/helpers/request.helper'
import { BaseService, emptyFacet, Facet } from 'src/share/service/base.service'
import { toSlug } from 'src/share/utils/string.util'
import { WinstonLogger } from 'src/winston/winston.classes'
import { InjectLogger } from 'src/winston/winston.decorators'

/**
 * Front Service
 * @author KhoaVD
 */
@Injectable()
export class FrontService extends BaseService<any> {
    constructor(
        @Inject(CollectionList.POST_DEFAULT_COLLECTION) private postCollection: Collection<Post>,
        @Inject(CollectionList.BANNER_COLLECTION) private bannerCollection: Collection<Banner>,
        @Inject(CollectionList.CATEGORY_COLLECTION) private categoryCollection: Collection<Category>,
        @Inject(CollectionList.BILL_COLLECTION) private billCollection: Collection<Bill>,
        @Inject(CollectionList.QUOTE_COLLECTION) private quoteCollection: Collection<Quote>,
        @Inject(CollectionList.PROGRESS_COLLECTION) private progressCollection: Collection<Progress>,
        @InjectLogger(FRONT_KEY_LOGGER) private readonly frontLogger: WinstonLogger
    ) {
        super(frontLogger)
        this.frontLogger.setContext(this.constructor.name)
    }

    /**
     * get all posts for rendering sitemap.xml purpose
     * @returns all available posts
     */
    async getSitemap(): Promise<object[]> {
        const domainFilterCondition = await this.getFilterByDomainCondition()
        const result = await this.postCollection
            .aggregate([
                this.matchStage({ ...domainFilterCondition, isShow: true, deleteTime: null }),
                this.lookupStage({
                    from: CollectionList.CATEGORY_COLLECTION,
                    let: { categoryId: '$categoryId' },
                    pipeline: [
                        this.matchStage(
                            this.exprOperator(
                                this.andOperator(
                                    this.eqOperator('$_id', '$$categoryId'),
                                    this.eqOperator('$isShow', true)
                                )
                            )
                        ),
                        this.projectStage({ _id: 0, slug: 1, type: 1 })
                    ],
                    as: 'category'
                }),
                this.unwindStage({ path: $CATEGORY, preserveNullAndEmptyArrays: true }),
                this.matchStage({ category: this.neCondition(null) }),
                this.sortOperator({ categoryId: -1, updateTime: -1 }),
                this.projectStage({ _id: 0, slug: 1, category: 1, updateTime: 1 })
            ])
            .toArray()
        return result
    }

    /**
     * get all banner
     * @returns all banner documents
     */
    async getAllBanner(): Promise<object[]> {
        return this.find(this.bannerCollection, { isShow: true }, { sort: { order: 1, insertTime: 1 } })
    }

    /**
     * get all category
     * @returns all category documents
     */
    async getAllCategory(): Promise<object[]> {
        const projection = { name: 1, nameEn: 1, slug: 1, type: 1, parentId: 1 }
        const result = await this.find(this.categoryCollection, { isShow: true }, { projection })
        return await this.includeOrder(result, OrderCodes.CATEGORY)
    }

    /**
     * get category detail
     * @param slug
     * @returns category document
     */
    async getDetailCategory(slug: string): Promise<object> {
        const projection = { id: 1, name: 1, nameEn: 1, slug: 1 }
        const category = await this.findOne(this.categoryCollection, { slug, isShow: true }, { projection })
        if (!category) throw new HttpException('Danh mục không tồn tại', HttpStatus.BAD_REQUEST)
        category['posts'] = await this.find(
            this.db.collection(CollectionList.POST_DEFAULT_COLLECTION),
            { categoryId: category._id, isShow: true },
            { projection: { id: 1, slug: 1 }, sort: { insertTime: -1 } }
        )
        return category
    }

    /**
     * get all post
     * @param query
     * @returns all post documents
     */
    async getAllPost(query?: PostQuery): Promise<Facet> {
        const { page, language = LANG_VI, max, relateId, categoryId, tag } = query
        const collection = this.db.collection(`${CollectionList.POST_COLLECTION}_${language}`)

        // Get relate post (same tag or same category)
        if (relateId) {
            const post = await this.findOne<Post>(
                collection,
                { _id: new ObjectId(relateId), isShow: true },
                { projection: { tagSlug: 1, categoryId: 1 } }
            )
            if (!post) return emptyFacet()

            const projection = { title: 1, thumbnail: 1, slug: 1, description: 1, categoryId: 1 }
            const postList = post.tagSlug
                ? await this.find(
                      collection,
                      { _id: this.neCondition(post._id), isShow: true, tagSlug: this.inOperator(post.tagSlug) },
                      { limit: 9, projection }
                  )
                : []
            const length = postList ? postList.length : 0
            if (length < 9) {
                const postIds = postList.map(x => x._id)
                postIds.push(post._id)
                postList.push(
                    ...(await this.find(
                        collection,
                        { _id: this.ninOperator(postIds), isShow: true, categoryId: post.categoryId },
                        { limit: 9 - length, projection }
                    ))
                )
            }

            return { data: postList, totalRecords: postList.length }
        }
        const projection = {
            title: 1,
            thumbnail: 1,
            slug: 1,
            description: 1,
            category: { id: `${$CATEGORY}._id`, name: 1 },
            tag: 1
        }
        const pipeLine = [
            this.matchStage({
                ...(await this.getFilterByDomainCondition()),
                ...(!isNullOrUndefined(tag) ? { tagSlug: toSlug(tag) } : { categoryId: new ObjectId(categoryId) }),
                isShow: true
            }),
            this.sortOperator({ insertTime: -1 }),
            this.lookupStage({
                from: CollectionList.CATEGORY_COLLECTION,
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category'
            }),
            this.unwindStage({ path: $CATEGORY, preserveNullAndEmptyArrays: true }),
            this.projectStage(projection)
        ]
        const result = await this.aggregate(collection, pipeLine, page, max)
        return result.length > 0 ? result[0] : emptyFacet()
    }

    private async getFilterByDomainCondition(): Promise<object> {
        const host = RequestHelper.getOrigin()
        if (host) {
            const hostName = extractHostname(host)
            const domain = await this.db
                .collection(CollectionList.DOMAIN_COLLECTION)
                .findOne<Domain>(this.notDeleted({ name: { $regex: new RegExp(`${hostName}`, 'g') } }))
            if (domain) {
                return this.orOperator<Post>({ domainIds: null }, { domainIds: [] }, { domainIds: domain._id })
            }
        }
        return {}
    }

    /**
     * get post detail
     * @param slug
     * @returns post document
     */
    async getDetailPost(slug: string, language = LANG_VI): Promise<object> {
        const collection = this.db.collection(`${CollectionList.POST_COLLECTION}_${language}`)
        const projection = { title: 1, slug: 1, content: 1, thumbnail: 1, images: 1, tag: 1, seo: 1, description: 1 }
        const result = await this.findOne(collection, { slug, isShow: true }, { projection })
        if (!result) throw new HttpException('Bài viết không tồn tại', HttpStatus.BAD_REQUEST)
        return result
    }

    /**
     * get bill detail
     * @param code
     * @returns bill document
     */
    async getDetailBill(code: string): Promise<object> {
        const projection = {
            goodsInfo: 1,
            senderInfo: 1,
            receiverInfo: 1,
            progress: 1,
            weight: 1,
            weightUnit: 1,
            truck: 1
        }
        const bill = await this.findOne(this.billCollection, { code }, { projection })
        if (!bill) throw new HttpException('Vận đơn không tồn tại', HttpStatus.BAD_REQUEST)

        let progress = await this.find(this.progressCollection, {}, { projection: { code: 1, name: 1 } })
        progress = await this.includeOrder(progress, OrderCodes.PROGRESS)
        bill['status'] = progress?.reduce((acc, c) => {
            acc.push(c.code === bill.progress.code ? { ...c, isActive: true } : { ...c, isActive: false })
            return acc
        }, [])
        return bill
    }

    /**
     * insert quote
     * @param body
     * @return quote document
     */
    async insertQuote(body: object): Promise<object> {
        const result = await this.insertOne(this.quoteCollection, { ...body, status: 1 })
        if (!result.ops[0]) return EMPTY_OBJECT
        return result.ops[0]
    }
}
