import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

export const InsertUserSchema: SchemaObject = {
    type: 'object',
    properties: {
        name: {
            type: 'string'
        },
        tel: {
            type: 'string'
        },
        birthday: {
            type: 'string'
        },
        email: {
            type: 'string'
        },
        username: {
            type: 'string'
        }
    },
    required: ['name', 'tel', 'birthday', 'email', 'username'],
    example: {
        name: 'string',
        tel: 'string',
        birthday: 'string',
        email: 'string',
        username: 'string'
    }
}

export const UpdateUserSchema: SchemaObject = {
    type: 'object',
    properties: {
        name: {
            type: 'string'
        },
        tel: {
            type: 'string'
        },
        birthday: {
            type: 'string'
        },
        email: {
            type: 'string'
        }
    },
    example: {
        name: '',
        tel: '',
        birthday: '',
        email: ''
    }
}
