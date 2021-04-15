import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, MaxLength, ValidateNested } from 'class-validator'
import { CollectionList } from 'src/share/constants/collection.constant'
import { Exist } from 'src/share/validator/base.validator'

/**
 * Province Validator
 * @author Khoa
 */

class District {
    @IsNotEmpty({ message: 'district name should not be empty' })
    @MaxLength(50)
    name: string

    @IsNotEmpty()
    @IsNumber()
    code: number
}

export class ProvinceValidator {
    @IsNotEmpty()
    @MaxLength(50)
    name: string

    @Type(() => District)
    @ValidateNested({ each: true })
    district: District[]
}

export class InsertProvinceValidator extends ProvinceValidator {
    @IsNotEmpty()
    @Exist({ collection: CollectionList.PROVINCE_COLLECTION, field: 'code', result: false })
    @IsNumber()
    code: number
}
