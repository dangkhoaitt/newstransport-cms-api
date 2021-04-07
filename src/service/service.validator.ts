import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsBooleanString,
    ValidateIf,
    ValidateNested,
    IsMongoId,
    Matches
} from 'class-validator'
import { BooleanString } from '../share/types'
import { Type, Transform } from 'class-transformer'
import { removeSpecialCharacter } from 'src/share/utils/string.util'

/**
 * Service Validator
 * @author Thuan
 */

export class Price {
    @IsOptional()
    @IsNumber()
    weightTo: number

    @IsNotEmpty()
    @IsNumber()
    price: number

    @IsOptional()
    @IsMongoId()
    truckId: string

    truckName: string
    truckCode: string
}

export class Distance {
    @IsOptional()
    @IsNumber()
    positionFrom: number

    positionFromName: string

    @IsOptional()
    @IsNumber()
    positionTo: number

    positionToName: string

    @IsNotEmpty()
    @Type(() => Price)
    @ValidateNested({ each: true })
    priceArr: Price[]
}

export class ServiceBody {
    @IsNotEmpty()
    @Matches(/^[0-9a-zA-Z_-]{1,}$/, { message: 'Mã dịch vụ không được chứa kí tự đặc biệt!' })
    code: string

    @IsNotEmpty()
    name: string

    @IsNotEmpty()
    @IsBoolean()
    isExtra: boolean

    @IsNotEmpty()
    @IsBoolean()
    isFix: boolean

    @IsOptional()
    @IsNumber()
    weightUnit: number

    @ValidateIf(o => o.isFix === false)
    @IsNotEmpty()
    @IsBoolean()
    isDistance: boolean

    @ValidateIf(o => o.isFix === false)
    @IsNotEmpty()
    @IsBoolean()
    isTruck: boolean

    @ValidateIf(o => o.isFix === false)
    @IsNotEmpty()
    @IsBoolean()
    isWeight: boolean

    @IsOptional()
    @IsNumber()
    price: number

    @IsOptional()
    @Type(() => Distance)
    @ValidateNested({ each: true })
    distanceArr: Distance[]

    @IsOptional()
    @IsNumber()
    order: number

}

export class ServiceSearch {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page: number

    @IsOptional()
    @IsString()
    @Transform(removeSpecialCharacter)
    code: string

    @IsOptional()
    @IsString()
    @Transform(removeSpecialCharacter)
    name: string

    @IsOptional()
    @IsBooleanString()
    isExtra: BooleanString
}
