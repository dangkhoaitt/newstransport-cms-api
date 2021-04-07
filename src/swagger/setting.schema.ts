import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const SettingSchema: SchemaObject = {
    type: 'object',
    properties: {
        parentCode: {
            type: 'string'
        },
        code: {
            type: 'string'
        },
        name: {
            type: 'string'
        }
    },
    required: ['code', 'name']
}

export default SettingSchema
