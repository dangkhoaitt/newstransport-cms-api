import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import { ImageSchema } from './base.schema'

export const BannerSchema: SchemaObject = {
    type: 'object',
    properties: {
        title: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        image: ImageSchema,
        order: {
            type: 'number'
        },
        show: {
            type: 'number'
        },
        language: {
            type: 'string'
        }
    },
    required: ['image'],
    example: {
        title: 'string',
        description: 'string',
        image: { url: 'string', thumbUrl: 'string', mediumUrl: 'string', alt: 'string' },
        order: 1,
        show: true,
        language: 'vi'
    }
}
export default BannerSchema
