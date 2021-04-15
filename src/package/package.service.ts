import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { Collection, ObjectId } from 'mongodb'
import { isNullOrUndefined } from 'src/share/common'
import { CollectionList } from 'src/share/constants/collection.constant'
import { BaseService } from 'src/share/service/base.service'
import { WinstonLogger } from 'src/winston/winston.classes'
import { InjectLogger } from 'src/winston/winston.decorators'
import { Package } from './package.interface'
import { PackageValidator } from './package.validator'

/**
 * Package Service
 * @author Khoa
 */
@Injectable()
export class PackageService extends BaseService<Package> {
    constructor(
        @Inject(CollectionList.PACKAGE_COLLECTION) private collection: Collection<Package>,
        @InjectLogger(CollectionList.PACKAGE_COLLECTION) private readonly packageLogger: WinstonLogger
    ) {
        super(packageLogger)
        this.packageLogger.setContext(this.constructor.name)
    }

    /**
     * This method is get all "packages"
     * @returns Facet
     */
    async getAll(): Promise<object[]> {
        const result = await this.find(this.collection, {})
        return await this.includeOrder(result, 'package')
    }

    /**
     * This method is get detail 'package'
     * @param id
     * @returns packageDetail || EMPTY_OBJECT
     */
    async getDetail(id: string): Promise<object> {
        const pk = await this.findOne(this.collection, { _id: new ObjectId(id) })
        if (!pk) throw new HttpException('', HttpStatus.NO_CONTENT)
        const order = await this.getOrder('package')
        pk['order'] = order?.['idList'].indexOf(id) + 1
        return pk
    }

    /**
     * This method is insert 'package'
     * @param body
     * @return insertPackage || EMPTY_OBJECT
     */
    async insert(body: PackageValidator): Promise<object> {
        const order = body.order || 1

        const result = await this.insertOne(this.collection, { ...body, order: undefined })
        await this.insertOrder('package', result.ops[0]._id.toString(), order)

        return this.getDetail(result.ops[0]._id.toString())
    }

    async edit(id: string, body: PackageValidator): Promise<object> {
        if (!isNullOrUndefined(body.name)) {
            const result = await this.findOneAndUpdate(this.collection, { _id: new ObjectId(id) }, { name: body.name })
            if (!result.value) throw new HttpException('', HttpStatus.NO_CONTENT)
        }

        if (!isNullOrUndefined(body['order'])) await this.updateOrder('package', id, body['order'])
        return this.getDetail(id)
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.deleteOne(this.collection, { _id: new ObjectId(id) })
        if (!result.modifiedCount) throw new HttpException('trạng thái kế toán không tồn tại', HttpStatus.BAD_REQUEST)
        await this.deleteOrder('package', id)
        return null
    }
}
