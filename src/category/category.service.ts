import { HttpException, HttpStatus, Inject, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { Collection, ObjectId } from 'mongodb'
import { isNullOrUndefined, isObjectEmpty, isTrue, isUndefined } from 'src/share/common'
import { CollectionList } from 'src/share/constants/collection.constant'
import { BaseService } from 'src/share/service/base.service'
import { WinstonLogger } from 'src/winston/winston.classes'
import { InjectLogger } from 'src/winston/winston.decorators'
import { CATEGORY, POSTS, SUB_CATEGORIES } from './category.constant'
import { Category } from './category.interface'
import { CategoryQuery, CategoryValidator, InsertCategoryValidator } from './category.validator'

/**
 * Category Service
 * @author KhoaVD
 */
@Injectable()
export class CategoryService extends BaseService<Category> {
    constructor(
        @Inject(CollectionList.CATEGORY_COLLECTION) private collection: Collection<Category>,
        @InjectLogger(CollectionList.CATEGORY_COLLECTION) private readonly categoryLogger: WinstonLogger
    ) {
        super(categoryLogger)
        this.categoryLogger.setContext(this.constructor.name)
    }

    async create(body: InsertCategoryValidator): Promise<object> {
        const { isShow = true, name, parentId, type, nameEn } = body

        const slug = await this.genSlug(this.collection, name)
        const data = { _id: new ObjectId(), name, slug, type, isShow, nameEn }
        if (parentId) data['parentId'] = new ObjectId(parentId)
        const result = await this.insertOne(this.collection, data)
        if (!result.ops[0]) throw new UnprocessableEntityException()

        await this.insertOrder('category', result.ops[0]._id.toString(), body.order)
        result.ops[0].order = body.order
        return result.ops[0]
    }

    async getAll(query?: CategoryQuery): Promise<object[]> {
        const { name, isParent, isShow, type } = query
        const filter = {}
        if (!isNullOrUndefined(name)) filter['$text'] = { $search: name }
        if (!isNullOrUndefined(isParent))
            filter['parentId'] = isParent === 'true' ? this.eqCondition(null) : this.existsOperator(true)
        if (!isNullOrUndefined(isShow)) filter['isShow'] = isTrue(isShow)
        if (!isNullOrUndefined(type)) filter['type'] = type
        const result = await this.find(this.collection, filter)
        return await this.includeOrder(result, 'category')
    }

    async getDetail(_id: ObjectId): Promise<object> {
        const category = await this.findOne(this.collection, { _id })
        if (!category) throw new HttpException('', HttpStatus.NO_CONTENT)
        if (category.parentId) {
            const parent = await this.findOne(this.collection, { _id: new ObjectId(category.parentId) })
            category.parentName = parent?.name
        }
        if (!category) throw new HttpException('', HttpStatus.NO_CONTENT)
        category['subCategories'] = await this.find(
            this.collection,
            { parentId: new ObjectId(category._id) },
            { projection: this.projectCateDetail() }
        )

        category['posts'] = await this.find(
            this.db.collection('post_vi'),
            {
                $or: [{ categoryId: { $in: category['subCategories'].map(x => x._id) } }, { categoryId: category._id }]
            },
            { projection: this.projectPostDetail() }
        )
        category['posts']?.forEach(p => {
            p.categoryName = category['subCategories'].find(c => c._id.toString() === p.categoryId)?.name
        })
        const order = await this.getOrder('category')
        const orderIndex = order?.['idList'].indexOf(category._id?.toString()) + 1
        category.order = orderIndex
        return category
    }

    async edit(id: string, body: CategoryValidator): Promise<object> {
        const document = {}
        let result
        if (!isNullOrUndefined(body.name)) document['name'] = body.name
        if (!isUndefined(body.nameEn)) document['nameEn'] = body.nameEn
        if (!isNullOrUndefined(body.isShow)) document['isShow'] = body.isShow
        if (!isUndefined(body.parentId)) document['parentId'] = new ObjectId(body.parentId)
        if (!isObjectEmpty(document)) {
            result = await this.findOneAndUpdate(this.collection, { _id: new ObjectId(id) }, document)
            if (!result.value) throw new HttpException('', HttpStatus.NO_CONTENT)
            if (!isNullOrUndefined(body.order)) await this.updateOrder('category', id, body.order)
            result.value['order'] = body.order
            return result.value
        } else if (isNullOrUndefined(body.order)) {
            throw new HttpException('', HttpStatus.NO_CONTENT)
        } else {
            result = await this.findOne(this.collection, { _id: new ObjectId(id) })
            if (!result) throw new HttpException('', HttpStatus.NO_CONTENT)
            await this.updateOrder('category', id, body.order)
            result['order'] = body.order
            return result
        }
    }

    async delete(id: string): Promise<null> {
        const deleteCate = await this.deleteOne(this.collection, { _id: new ObjectId(id) })
        await this.deleteOrder('category', id)
        if (deleteCate.modifiedCount > 0) return null
        throw new HttpException('danh mục không tồn tại', HttpStatus.BAD_REQUEST)
    }

    async dropdown(query: CategoryQuery): Promise<object[]> {
        const { isParent } = query
        return !isNullOrUndefined(isParent)
            ? this.collection
                  .aggregate([
                      this.lookupStage({
                          from: 'post_vi',
                          let: { idRoot: '$_id' },
                          pipeline: [
                              {
                                  $match: {
                                      $expr: { $eq: ['$categoryId', '$$idRoot'] },
                                      deleteTime: this.eqCondition(null)
                                  }
                              }
                          ],
                          as: POSTS
                      }),
                      this.lookupStage({
                          from: CATEGORY,
                          let: { idRoot: '$_id' },
                          pipeline: [
                              {
                                  $match: {
                                      $expr: { $eq: ['$parentId', '$$idRoot'] },
                                      deleteTime: this.eqCondition(null)
                                  }
                              }
                          ],
                          as: SUB_CATEGORIES
                      }),
                      isTrue(isParent) === true
                          ? this.matchStage({ parentId: { $eq: null }, posts: { $eq: [] } })
                          : this.matchStage(this.orOperator({ posts: { $ne: [] } }, { subCategories: { $eq: [] } })),
                      this.projectStage({ _id: 1, name: 1, type: 1 })
                  ])
                  .toArray()
            : []
    }

    async isParent(id: string): Promise<boolean> {
        return this.isExists(this.collection, { _id: new ObjectId(id), parentId: null })
    }

    private projectCateDetail(): object {
        return { id: 1, type: 1, name: 1, 'insertBy.name': 1, 'insertBy.userId': 1, isShow: 1, insertTime: 1 }
    }

    private projectPostDetail(): object {
        return { id: 1, title: 1, 'insertBy.name': 1, 'insertBy.userId': 1, isShow: 1, insertTime: 1, categoryId: 1 }
    }
}
