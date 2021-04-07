import { Transform, Type } from 'class-transformer'
import {
    IsBoolean,
    IsBooleanString,
    isMongoId,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator'
import { ObjectId } from 'mongodb'
import { removeExtraSpaces } from 'src/share/utils/string.util'
import { BooleanString } from '../share/types'
import { CategoryService } from './category.service'

/**
 * Category Validator
 * @author KhoaVD
 */

@ValidatorConstraint()
export class IsParentConstraint implements ValidatorConstraintInterface {
    constructor(private categoryService: CategoryService) {}
    async validate(parentId: string): Promise<boolean> {
        return isMongoId(parentId) && (await this.categoryService.isParent(parentId))
    }
}

export class CategoryValidator {
    @MaxLength(50)
    @IsString()
    @IsNotEmpty()
    name: string

    @MaxLength(50)
    @IsString()
    @IsOptional()
    nameEn: string

    @Min(1)
    @IsNumber()
    @IsOptional()
    order: number

    @IsBoolean()
    @IsOptional()
    isShow: boolean

    @Validate(IsParentConstraint)
    @IsMongoId()
    @IsOptional()
    parentId: ObjectId
}

export class InsertCategoryValidator extends CategoryValidator {
    @Max(2)
    @Min(1)
    @IsNumber()
    @IsNotEmpty()
    type: number
}

export class DeleteCategoryValidator {
    @IsMongoId()
    id: string
}

export class CategoryQuery {
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    page: number

    @Transform(removeExtraSpaces)
    @IsString()
    @IsOptional()
    name: string

    @IsBooleanString()
    @IsOptional()
    isParent: BooleanString

    @IsBooleanString()
    @IsOptional()
    isShow: BooleanString

    @Max(2)
    @Min(1)
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    type: number

    @IsBooleanString()
    @IsOptional()
    isDropdown: BooleanString
}
