import { Transform } from 'class-transformer'
import { IsDefined, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator'
import { CollectionList } from 'src/share/constants/collection.constant'
import { removeExtraSpaces, removeSpace } from 'src/share/utils/string.util'
import { Exist } from 'src/share/validator/base.validator'

/**
 * Customer Validator
 * @author Thuan
 */
export class CustomerValidator {
    @IsOptional()
    @Transform(removeSpace)
    @Exist({ collection: CollectionList.CUSTOMER_COLLECTION, field: 'code', result: false })
    @MaxLength(50)
    @IsString()
    @Matches(/^[0-9a-zA-Z_-]{1,}$/, { message: 'Mã khách hàng không được chứa kí tự đặc biệt!' })
    code: string

    @IsNotEmpty()
    @Transform(removeExtraSpaces)
    @MaxLength(100)
    @IsString()
    name: string

    @IsNotEmpty()
    @Transform(removeExtraSpaces)
    @MaxLength(50)
    @IsString()
    tel: string

    @IsNotEmpty()
    @Transform(removeExtraSpaces)
    @MaxLength(250)
    @IsString()
    address: string

    @IsNotEmpty()
    @IsNumber()
    province: number

    @IsNotEmpty()
    @IsNumber()
    district: number
}

export class EditCustomerValidator extends CustomerValidator {
    @IsNotEmpty()
    @Exist({ collection: CollectionList.CUSTOMER_COLLECTION, field: 'code', result: false })
    @Transform(removeSpace)
    @MaxLength(50)
    @Matches(/^[0-9a-zA-Z_-]{1,}$/, { message: 'Mã khách hàng không được chứa kí tự đặc biệt!' })
    @IsString()
    code: string

    @ValidateIf(p => p.province)
    @IsDefined()
    @IsNotEmpty()
    @IsNumber()
    district: number
}
