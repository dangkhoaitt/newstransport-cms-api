import { registerDecorator, ValidationOptions } from 'class-validator'
import { CheckDate } from '../utils/date.util'
import { isValidPhoneNumber } from '../utils/phone.util'

export function IsVNDate(validationOptions?: ValidationOptions) {
    return function(object: object, propertyName: string): void {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: string): boolean {
                    return CheckDate(value)
                },
                defaultMessage(): string {
                    return 'Ngày tháng không hợp lệ !'
                }
            }
        })
    }
}

export function IsVNPhone(validationOptions?: ValidationOptions) {
    return function(object: object, propertyName: string): void {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: string): boolean {
                    return isValidPhoneNumber(value)
                },
                defaultMessage(): string {
                    return 'Số điện thoại không hợp lệ !'
                }
            }
        })
    }
}
