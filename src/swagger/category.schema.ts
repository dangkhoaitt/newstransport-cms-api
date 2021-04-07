import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

export const CategorySchema: SchemaObject = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        parentId: { type: 'string' },
        type: { type: 'string' },
        show: { type: 'boolean' },
        language: { type: 'string' },
        order: { type: 'number' }
    },
    required: ['name', 'type', 'show']
}

export const UpdateCategorySchema: SchemaObject = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        type: { type: 'string' },
        show: { type: 'boolean' },
        language: { type: 'string' },
        order: { type: 'number' }
    },
    example: { name: '', type: '', show: 'boolean', language: '', order: 'number' }
}
