import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

export const ImageSchema: SchemaObject = {
    type: 'object',
    properties: {
        url: {
            type: 'string'
        },
        thumbUrl: {
            type: 'string'
        },
        mediumUrl: {
            type: 'string'
        },
        alt: {
            type: 'string'
        }
    }
}
