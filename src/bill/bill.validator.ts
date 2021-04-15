import { Transform, Type } from 'class-transformer'
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    ValidateIf,
    ValidateNested
} from 'class-validator'
import { CollectionList } from 'src/share/constants/collection.constant'
import { removeSpace, removeSpecialCharacter } from 'src/share/utils/string.util'
import { Exist } from 'src/share/validator/base.validator'
import { DiscountType, WeightUnit } from './bill.constant'

/**
 * Bill Validator
 * @author Khoa
 */

export class UserInfo {
    @IsOptional()
    @Exist({ collection: CollectionList.CUSTOMER_COLLECTION, field: 'code', result: true })
    @IsString()
    code: string

    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsString()
    tel: string

    @IsNotEmpty()
    @IsNumber()
    provinceCode: number

    @IsNotEmpty()
    @IsNumber()
    districtCode: number

    @IsNotEmpty()
    @IsString()
    address: string
}

class MainService {
    @IsNotEmpty()
    @Exist({ collection: CollectionList.SERVICE_COLLECTION, field: 'code', result: true })
    @IsString()
    code: string

    @IsNotEmpty()
    @IsNumber()
    price: number
}

export class ExtraService {
    @IsNotEmpty()
    @Exist({ collection: CollectionList.SERVICE_COLLECTION, field: 'code', result: true })
    @IsString()
    code: string

    @IsNotEmpty()
    @IsNumber()
    price: number
}

export class GoodsInfo {
    @IsOptional()
    @Exist({ collection: CollectionList.PACKAGE_COLLECTION, field: 'code', result: true })
    @IsString()
    package: string

    @IsOptional()
    @IsNumber()
    quantity: number

    @IsOptional()
    @IsString()
    content: string
}
export class BillValidator {
    @IsOptional()
    @Transform(removeSpace)
    @Exist({ collection: CollectionList.BILL_COLLECTION, field: 'code', result: false })
    @Matches(/^[0-9a-zA-Z_-]{1,}$/, { message: 'Mã vận đơn không được chứa kí tự đặc biệt!' })
    @IsString()
    code: string

    @IsNotEmpty()
    @Type(() => UserInfo)
    @ValidateNested({ each: true })
    senderInfo: UserInfo

    @IsNotEmpty()
    @Type(() => UserInfo)
    @ValidateNested({ each: true })
    receiverInfo: UserInfo

    @IsOptional()
    @Type(() => GoodsInfo)
    @ValidateNested({ each: true })
    goodsInfo: GoodsInfo[]

    @IsNotEmpty()
    @Exist({ collection: CollectionList.PROGRESS_COLLECTION, field: 'code', result: true })
    @IsString()
    progress: string

    @IsNotEmpty()
    @Exist({ collection: CollectionList.FINANCE_COLLECTION, field: 'code', result: true })
    @IsString()
    finance: string

    @IsNotEmpty()
    @Type(() => MainService)
    @ValidateNested({ each: true })
    mainService: MainService

    @IsOptional()
    @Type(() => ExtraService)
    @ValidateNested({ each: true })
    extraService: ExtraService[]

    @IsOptional()
    @IsNumber()
    weight: number

    @ValidateIf(w => w.weight)
    @IsNotEmpty()
    @IsEnum(WeightUnit)
    @IsNumber()
    weightUnit: number

    @IsOptional()
    @IsString()
    truck: string

    @IsOptional()
    @IsNumber()
    discount: number

    @ValidateIf(d => d.discount)
    @IsNotEmpty()
    @IsEnum(DiscountType)
    @IsNumber()
    discountUnit: number

    @IsNotEmpty()
    @IsNumber()
    total: number

    @IsOptional()
    @IsNumber()
    inventory: number

    @IsOptional()
    @IsString()
    deliverMember: string
}

export class BillSearch {
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
    customerCode: string

    @IsOptional()
    @IsString()
    sendName: string

    @IsOptional()
    @IsString()
    receiveName: string

    @IsOptional()
    @IsString()
    service: string

    @IsOptional()
    @IsString()
    progress: string

    @IsOptional()
    @IsString()
    finance: string

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    insertTimeFrom: number

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    insertTimeTo: number

    @IsOptional()
    @IsString()
    sendUnit: string

    @IsOptional()
    @IsString()
    userId: string
}

class MainServiceImport {
    @IsNotEmpty()
    @Exist({ collection: CollectionList.SERVICE_COLLECTION, field: 'code', result: true })
    @IsString()
    code: string
}

class ExtraServiceImport {
    @IsNotEmpty()
    @Exist({ collection: CollectionList.SERVICE_COLLECTION, field: 'code', result: true })
    @IsString()
    code: string
}

class BillImportItem {
    @IsOptional()
    @Transform(removeSpace)
    @Exist(
        { collection: CollectionList.BILL_COLLECTION, field: 'code', result: false },
        { message: 'Mã vận đơn đã tồn tại' }
    )
    @IsString()
    code: string

    @IsNotEmpty()
    @Type(() => UserInfo)
    @ValidateNested({ each: true })
    receiverInfo: UserInfo

    @IsOptional()
    @Type(() => GoodsInfo)
    @ValidateNested({ each: true })
    goodsInfo: GoodsInfo[]

    @IsNotEmpty()
    @Exist({ collection: CollectionList.PROGRESS_COLLECTION, field: 'code', result: true })
    @IsString()
    progress: string

    @IsNotEmpty()
    @Exist({ collection: CollectionList.FINANCE_COLLECTION, field: 'code', result: true })
    @IsString()
    finance: string

    @IsNotEmpty()
    @Type(() => MainServiceImport)
    @ValidateNested({ each: true })
    mainService: MainServiceImport

    @IsOptional()
    @Type(() => ExtraServiceImport)
    @ValidateNested({ each: true })
    extraService: ExtraServiceImport[]

    @IsOptional()
    @IsNumber()
    weight: number

    @IsNotEmpty()
    @IsNumber()
    total: number
}

export class BillImportValidator {
    @IsNotEmpty()
    @Type(() => UserInfo)
    @ValidateNested({ each: true })
    senderInfo: UserInfo

    @Type(() => BillImportItem)
    @ValidateNested({ each: true })
    items: BillImportItem[]
}
