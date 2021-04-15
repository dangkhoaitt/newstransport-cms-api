import { IsNotEmpty, IsNumber, IsOptional, MaxLength } from 'class-validator'
import { CollectionList } from 'src/share/constants/collection.constant'
import { Exist } from 'src/share/validator/base.validator'

/**
 * Finance Validator
 * @author KhoaVD
 */

export class FinanceValidator {
    @IsNotEmpty()
    @MaxLength(50)
    name: string

    @IsNotEmpty()
    @Exist({ collection: CollectionList.FINANCE_COLLECTION, field: 'code', result: false })
    @MaxLength(10)
    code: string

    @IsOptional()
    @IsNumber()
    order: number
}
