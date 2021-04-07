import { Inject } from '@nestjs/common'
import {
    IsMongoId,
    IsNotEmpty,
    IsUrl,
    MaxLength,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator'
import { Db } from 'mongodb'
import { extractHostname } from 'src/share/common'
import { CollectionList } from 'src/share/constants/collection.constant'
import { MONGODB_PROVIDER } from 'src/share/constants/mongodb.constant'

@ValidatorConstraint()
export class IsDomainUniqueConstraint implements ValidatorConstraintInterface {
    constructor(@Inject(MONGODB_PROVIDER) private db: Db) {}
    async validate(domainName: string): Promise<boolean> {
        const hostname = extractHostname(domainName, { keepProtocol: true })
        const domainExistsCount = await this.db
            .collection(CollectionList.DOMAIN_COLLECTION)
            .countDocuments({ name: { $regex: new RegExp(`${hostname}`, 'g') }, deleteTime: { $eq: null } })
        return domainExistsCount === 0
    }
}

export class DomainValidator {
    @Validate(IsDomainUniqueConstraint, { message: 'Tên miền đã tồn tại' })
    @IsUrl({ protocols: ['http', 'https'] }, { message: 'Tên miền không hợp lệ' })
    @MaxLength(255)
    @IsNotEmpty()
    name: string
}

export class DeleteDomainValidator {
    @IsMongoId()
    id: string
}
