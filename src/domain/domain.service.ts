import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { Collection, ObjectId } from 'mongodb'
import { Post } from 'src/post/post.interface'
import { extractHostname } from 'src/share/common'
import { CollectionList } from 'src/share/constants/collection.constant'
import { BaseService } from 'src/share/service/base.service'
import { WinstonLogger } from 'src/winston/winston.classes'
import { InjectLogger } from 'src/winston/winston.decorators'
import { Domain } from './domain.interface'
import { DomainValidator } from './domain.validator'

@Injectable()
export class DomainService extends BaseService<Domain> {
    constructor(
        @Inject(CollectionList.DOMAIN_COLLECTION) private collection: Collection<Domain>,
        @InjectLogger(CollectionList.DOMAIN_COLLECTION) private readonly domainLogger: WinstonLogger
    ) {
        super(domainLogger)
        this.domainLogger.setContext(this.constructor.name)
    }

    async getAll(): Promise<Domain[]> {
        return this.find(this.collection, {})
    }

    async insert(body: DomainValidator): Promise<Domain> {
        const { name } = body
        const hostname = extractHostname(name, { keepProtocol: true })
        const result = await this.insertOne(this.collection, { name: hostname })
        return result.ops[0]
    }

    async edit(id: string, body: object): Promise<object> {
        const result = await this.findOneAndUpdate(this.collection, { _id: new ObjectId(id) }, body)
        if (result.value) return result.value
        throw new HttpException('', HttpStatus.NO_CONTENT)
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.deleteOne(this.collection, { _id: new ObjectId(id) })
        if (result.modifiedCount > 0) {
            const objId = new ObjectId(id)
            const postCollections = await this.getAllPostCollectionName()
            // Pull all deleted domain id from all posts
            await Promise.all(
                postCollections.map(collectionName =>
                    this.db
                        .collection<Post>(collectionName)
                        .updateMany({ domainIds: objId }, this.pullOperator({ domainIds: objId }))
                )
            )
            return null
        }
        throw new HttpException('', HttpStatus.BAD_REQUEST)
    }

    private async getAllPostCollectionName(): Promise<string[]> {
        const listCollections = await this.db.listCollections().toArray()
        return listCollections.map(({ name }) => name).filter(x => x.indexOf('post_') !== -1)
    }
}
