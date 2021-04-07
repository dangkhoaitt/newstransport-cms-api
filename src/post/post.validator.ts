import { Inject } from '@nestjs/common'
import { Type } from 'class-transformer'
import {
    Allow,
    IsBoolean,
    IsBooleanString,
    IsIn,
    isMongoId,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Validate,
    ValidateNested,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator'
import { Db, ObjectId } from 'mongodb'
import { isObjectEmpty, parseMongoId } from 'src/share/common'
import { CollectionList } from 'src/share/constants/collection.constant'
import { MONGODB_PROVIDER } from 'src/share/constants/mongodb.constant'
import { BooleanString } from '../share/types'

/**
 * Post Validator
 * @author KhoaVD
 */

@ValidatorConstraint()
export class IsCategoryValidConstraint implements ValidatorConstraintInterface {
    constructor(@Inject(MONGODB_PROVIDER) private db: Db) {}
    async validate(categoryId: string): Promise<boolean> {
        if (!isMongoId(categoryId)) return false
        const category = await this.db
            .collection(CollectionList.CATEGORY_COLLECTION)
            .findOne({ _id: new ObjectId(categoryId), deleteTime: { $eq: null } })
        if (isObjectEmpty(category)) return false
        const subCategory = await this.db
            .collection(CollectionList.CATEGORY_COLLECTION)
            .findOne({ parentId: new ObjectId(categoryId), deleteTime: { $eq: null } })
        return isObjectEmpty(subCategory)
    }
}

@ValidatorConstraint()
export class IsDomainValidConstraint implements ValidatorConstraintInterface {
    constructor(@Inject(MONGODB_PROVIDER) private db: Db) {}
    async validate(domainIds: string[]): Promise<boolean> {
        const domainExistsCount = await this.db
            .collection(CollectionList.DOMAIN_COLLECTION)
            .countDocuments({ _id: { $in: parseMongoId(domainIds) }, deleteTime: { $eq: null } })
        return domainExistsCount === domainIds.length
    }
}

export class Image {
    @IsString()
    @IsOptional()
    url: string

    @IsString()
    @IsOptional()
    thumbUrl: string

    @IsString()
    @IsOptional()
    mediumUrl: string

    @IsString()
    @IsOptional()
    alt: string
}

export class Seo {
    @IsString()
    @IsOptional()
    title: string

    @IsString()
    @IsOptional()
    description: string

    @IsString()
    @IsOptional()
    keywords: string
}

export class PostValidator {
    @IsString()
    @IsNotEmpty()
    title: string

    @IsNotEmpty()
    @IsString()
    description: string

    @Type(() => Seo)
    @ValidateNested({ each: true })
    @IsOptional()
    seo: Seo

    @IsString()
    @IsNotEmpty()
    content: string

    @Type(() => Image)
    @ValidateNested({ each: true })
    @IsOptional()
    thumbnail: Image

    @Type(() => Image)
    @ValidateNested({ each: true })
    @IsOptional()
    images: Image[]

    @IsString()
    @IsOptional()
    tag: string

    @IsBoolean()
    @IsOptional()
    isShow: boolean

    @Validate(IsDomainValidConstraint)
    @IsMongoId({ each: true })
    @IsOptional()
    domainIds: string[]

    @Validate(IsCategoryValidConstraint)
    @IsString()
    @IsNotEmpty()
    categoryId: string
}

export class GetPostDetailValidator {
    @IsMongoId()
    @IsString()
    id: string
}

export class QueryValidator {
    @IsIn(['vi', 'en'])
    @IsOptional()
    language: string

    @Allow()
    isSlug: boolean
}

export class PostQuery {
    @IsBooleanString()
    @IsOptional()
    allDomain: BooleanString

    @IsOptional()
    @IsMongoId()
    domainId: string

    @IsMongoId()
    @IsOptional()
    categoryId: string

    @IsString()
    @IsOptional()
    title: string

    @IsBooleanString()
    @IsOptional()
    isShow: BooleanString

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    page: number

    @IsIn(['vi', 'en'])
    @IsOptional()
    language: string

    @IsString()
    @IsOptional()
    tag: string

    @IsOptional()
    max: string

    @IsOptional()
    @IsMongoId()
    relateId: string
}
