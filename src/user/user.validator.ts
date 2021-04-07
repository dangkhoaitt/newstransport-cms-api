import { ForbiddenException } from '@nestjs/common'
import { Transform, Type } from 'class-transformer'
import {
    IsBoolean,
    IsIn,
    isMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Validate,
    ValidateIf,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator'
import { IsVNDate } from 'src/share/common/validator'
import { CollectionList } from 'src/share/constants/collection.constant'
import { RequestHelper } from 'src/share/helpers/request.helper'
import { removeSpecialCharacter } from 'src/share/utils/string.util'
import { Exist } from 'src/share/validator/base.validator'
import { ADMIN, MANAGER, MEMBER, Role } from './user.constant'
import { User } from './user.interface'
import { UserService } from './user.service'

/**
 * User Validator
 * @author KhoaVD
 */

@ValidatorConstraint()
export class CanEditValidation implements ValidatorConstraintInterface {
    constructor(private userService: UserService) {}
    async validate(id: string): Promise<boolean> {
        if (isMongoId(id) === false) return false
        const loginUser = RequestHelper.getAuthUser()
        const editUser = (await this.userService.getDetail(id)) as User
        if (
            loginUser.role === ADMIN ||
            loginUser.userId === id ||
            (loginUser.role === MANAGER && loginUser.unit?.code === editUser.unit?.code)
        )
            return true
        throw new ForbiddenException()
    }
}

@ValidatorConstraint()
export class CanDeletevalidation implements ValidatorConstraintInterface {
    constructor(private userService: UserService) {}
    async validate(id: string): Promise<boolean> {
        if (isMongoId(id) === false) return false
        const loginUser = RequestHelper.getAuthUser()
        if (loginUser.role === ADMIN && loginUser.userId !== id) return true
        throw new ForbiddenException()
    }
}

export class EditUserValidator {
    @Validate(CanEditValidation)
    id: string
}

export class DeleteUserValidator {
    @Validate(CanDeletevalidation)
    id: string
}

export class UserValidator {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name: string

    @IsOptional()
    @IsString()
    @MaxLength(50)
    tel: string

    @IsOptional()
    @IsString()
    @IsVNDate()
    birthday: string

    @IsOptional()
    @IsString()
    @MaxLength(250)
    address: string

    @IsOptional()
    @IsString()
    @MaxLength(50)
    @Matches(/^(\s*[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,6}\s*)*$/)
    email: string

    @ValidateIf(o => o.role !== 'ADMIN')
    @IsNotEmpty()
    @IsString()
    @Exist({ collection: CollectionList.UNIT_COLLECTION, field: 'code', result: true })
    unit: string
}

export class InsertUserValidator extends UserValidator {
    @IsNotEmpty()
    @Matches(/^(\s*[a-zA-Z0-9]{5,20}\s*)$/)
    @Exist({ collection: CollectionList.USER_COLLECTION, field: 'username', result: false })
    username: string

    @IsNotEmpty()
    @IsIn([MANAGER, MEMBER])
    role: Role
}

export class UserQuery {
    @Type(() => Number)
    @IsNumber()
    page: number

    @IsString()
    @Transform(removeSpecialCharacter)
    username: string

    @IsString()
    name: string

    @IsString()
    @Transform(removeSpecialCharacter)
    email: string

    @IsIn([MANAGER, MEMBER])
    role: Role

    @IsString()
    @Transform(removeSpecialCharacter)
    tel: string

    @IsOptional()
    @Exist({ collection: CollectionList.UNIT_COLLECTION, field: 'code', result: true })
    @IsString()
    unitCode: string

    @Type(() => Boolean)
    @IsBoolean()
    dropdown: boolean
}
