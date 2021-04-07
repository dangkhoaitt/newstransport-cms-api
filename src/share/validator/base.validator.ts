import { Inject } from '@nestjs/common'
import {
    IsMongoId,
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator'
import { Db, ObjectId } from 'mongodb'
import { MONGODB_PROVIDER } from '../constants/mongodb.constant'

export class IdValidator {
    @IsMongoId()
    id: string
}

type Options = {
    collection: string | ((args: ValidationArguments) => string)
    field?: string
    result?: boolean
}
@ValidatorConstraint()
export class ExistConstraint implements ValidatorConstraintInterface {
    constructor(@Inject(MONGODB_PROVIDER) private db: Db) {}

    async validate(value: string, args: ValidationArguments): Promise<boolean> {
        const { collection, field, result } = args.constraints[0] as Options
        const oValue = field === '_id' ? new ObjectId(value) : value
        const collectionName = typeof collection === 'function' ? collection(args) : collection
        const count = await this.db
            .collection(collectionName)
            .countDocuments({ [field]: oValue, deleteTime: { $eq: null } })
        return result ? count === 1 : count === 0
    }

    defaultMessage(args: ValidationArguments): string {
        const { result } = args.constraints[0] as Options
        return result ? `${args.property} không tồn tại.` : `${args.property} đã tồn tại.`
    }
}

export function Exist(options: Options, validationOptions?: ValidationOptions) {
    return function(object: object, propertyName: string): void {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [options],
            validator: ExistConstraint
        })
    }
}
