import { IsNotEmpty, IsNumber, IsOptional, MaxLength } from 'class-validator'
import { CollectionList } from 'src/share/constants/collection.constant'
import { Exist } from 'src/share/validator/base.validator'

/**
 * Progress Validator
 * @author Khoa
 */

export class ProgressValidator {
    @IsNotEmpty()
    @MaxLength(50)
    name: string

    @IsNotEmpty()
    @Exist({ collection: CollectionList.PROGRESS_COLLECTION, field: 'code', result: false })
    @MaxLength(10)
    code: string

    @IsOptional()
    @IsNumber()
    order: number
}
