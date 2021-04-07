import { CustomDecorator, SetMetadata } from '@nestjs/common'

export function Public(): CustomDecorator<string> {
    return SetMetadata('isPublic', true)
}
