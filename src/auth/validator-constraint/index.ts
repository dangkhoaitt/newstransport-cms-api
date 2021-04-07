import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator'
import { AuthService } from '../auth.service'
import { AuthHelper } from '../helper/auth.helper'

@Injectable()
@ValidatorConstraint()
export class IsPasswordValidConstraint implements ValidatorConstraintInterface {
    constructor(private readonly authService: AuthService) {}

    async validate(value: string): Promise<boolean> {
        const id = AuthHelper.getCurrentAuth(value)
        AuthHelper.removeCurrentAuth(value)
        const authUser = await this.authService.findUserById(id, { projection: { password: 1 } })

        return bcrypt.compareSync(value, authUser.password)
    }

    defaultMessage(): string {
        return 'Mật khẩu hiện tại không đúng'
    }
}

export function IsPasswordValid(validationOptions?: ValidationOptions) {
    return function(object: unknown, propertyName: string): void {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsPasswordValidConstraint
        })
    }
}
