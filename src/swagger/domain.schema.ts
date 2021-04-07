import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const DomainSchema: SchemaObject = {
    type: 'object',
    properties: {
        name: {
            type: 'string'
        }
    },
    required: ['name']
}

export default DomainSchema
