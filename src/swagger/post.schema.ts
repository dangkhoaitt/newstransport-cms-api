import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import { ImageSchema } from './base.schema'

export const PostSeoSchema: SchemaObject = {
    type: 'object',
    properties: {
        title: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        keywords: {
            type: 'string'
        }
    },
    required: ['title', 'description', 'keywords']
}

const PostSchema: SchemaObject = {
    type: 'object',
    properties: {
        title: {
            type: 'string'
        },
        categoryId: {
            type: 'string'
        },
        seo: PostSeoSchema,
        content: {
            type: 'string'
        },
        thumbnail: ImageSchema,
        images: {
            type: 'array',
            items: ImageSchema
        },
        tags: {
            type: 'string'
        },
        order: {
            type: 'number'
        },
        show: {
            type: 'boolean'
        },
        language: {
            type: 'string'
        }
    },
    required: ['title', 'categoryId', 'content']
}

export default PostSchema
