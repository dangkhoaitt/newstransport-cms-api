import { Module } from '@nestjs/common'
import { MongodbModule } from 'src/mongodb/mongodb.module'
import { CollectionList } from 'src/share/constants/collection.constant'
import { WinstonModule } from 'src/winston/winston.module'
import { CategoryController } from './category.controller'
import { CategoryService } from './category.service'
import { IsParentConstraint } from './category.validator'

/**
 * Category Module
 * @author KhoaVD
 */
@Module({
    imports: [
        MongodbModule.useCollection(CollectionList.CATEGORY_COLLECTION),
        WinstonModule.useServiceLogger(CollectionList.CATEGORY_COLLECTION)
    ],
    controllers: [CategoryController],
    providers: [CategoryService, IsParentConstraint]
})
export class CategoryModule {}
