import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const ServiceSchema: SchemaObject = {
    type: 'object',
    properties: {
        type: { type: 'string' },
        code: { type: 'string' },
        name: { type: 'string' }
    },
    required: ['type', 'code', 'name']
}

export const SubServiceSchema: SchemaObject = {
    type: 'object',
    properties: {
        parentCode: { type: 'string' },
        code: { type: 'string' },
        name: { type: 'string' },
        expression: { type: 'string' },
        maxValue: { type: 'number' },
        description: { type: 'string' }
    },
    required: ['parentCode', 'code', 'name']
}

export const UpdateSubServiceSchema: SchemaObject = {
    type: 'object',
    properties: {
        parentCode: { type: 'string' },
        name: { type: 'string' },
        expression: { type: 'string' },
        maxValue: { type: 'number' },
        description: { type: 'string' }
    },
    required: ['parentCode', 'name']
}

export default ServiceSchema
