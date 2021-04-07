import { Module } from '@nestjs/common'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { CollectionList } from 'src/share/constants/collection.constant'
import { WinstonModule } from 'src/winston/winston.module'
import { PostController } from './post.controller'
import { PostService } from './post.service'
import { IsCategoryValidConstraint, IsDomainValidConstraint } from './post.validator'

/**
 * Post Module
 * @author KhoaVD
 */
@Module({
    imports: [
        MongodbModule.useCollection(CollectionList.POST_COLLECTION),
        WinstonModule.useServiceLogger(CollectionList.POST_COLLECTION)
    ],
    controllers: [PostController],
    providers: [PostService, IsCategoryValidConstraint, IsDomainValidConstraint],
    exports: [PostService]
})
export class PostModule {}
