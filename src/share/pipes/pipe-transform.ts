import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { isMongoId } from 'class-validator'
import { ObjectId } from 'mongodb'

/**
 * ParseMongoIdPipe
 * @author KhoaVD
 */
@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string> {
    transform(value: string, metadata: ArgumentMetadata): ObjectId {
        if (!isMongoId(value)) {
            throw new BadRequestException('Validation failed !')
        }
        return new ObjectId(value)
    }
}
