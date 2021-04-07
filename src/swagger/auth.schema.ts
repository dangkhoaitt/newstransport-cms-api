import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const AuthSchema: SchemaObject = {
    type: 'object',
    properties: {
        username: {
            type: 'string'
        },
        password: {
            type: 'string'
        },
        remember: {
            type: 'boolean'
        }
    },
    required: ['username', 'password'],
    example: {
        username: 'string',
        password: 'string',
        remember: false
    }
}

export const ChangePasswordSchema: SchemaObject = {
    type: 'object',
    properties: {
        oldPassword: {
            type: 'string'
        },
        password: {
            type: 'string'
        }
    },
    required: ['oldPassword', 'password']
}

export const RefreshTokenSchema: SchemaObject = {
    type: 'object',
    properties: {
        refreshToken: {
            type: 'string'
        }
    },
    required: ['refreshToken']
}

export default AuthSchema
