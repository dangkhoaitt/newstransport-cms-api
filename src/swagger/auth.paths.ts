import { OperationObject, PathsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const loginOperation: OperationObject = {
    tags: ['auth'],
    summary: 'Login to the system',
    operationId: 'login',
    parameters: [],
    requestBody: {
        required: true,
        description: 'Account information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/AuthRequest'
                }
            }
        }
    },
    responses: {
        '201': {
            description: 'Access token will be responded'
        },
        '400': {
            description: 'Account information must be provided'
        },
        '401': {
            description: 'Account information are not correct'
        }
    }
}

const refreshTokenOperation: OperationObject = {
    tags: ['auth'],
    summary: 'Get new access token',
    operationId: 'refreshToken',
    parameters: [],
    requestBody: {
        required: true,
        description: 'Refresh token',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/RefreshTokenRequest'
                }
            }
        }
    },
    responses: {
        '201': {
            description: 'Access token will be responded'
        },
        '400': {
            description: 'Refresh token must be a JWT string'
        }
    }
}

const getRoleOperation: OperationObject = {
    tags: ['auth'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get role by userId',
    operationId: 'getRole',
    parameters: [],
    responses: {
        '201': {
            description: ''
        }
    }
}

const changePasswordOperation: OperationObject = {
    tags: ['auth'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Change password',
    operationId: 'changePassword',
    parameters: [],
    requestBody: {
        required: true,
        description: 'Change password',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/ChangePasswordValidator'
                }
            }
        }
    },
    responses: {
        '201': {
            description: ''
        }
    }
}

const authPaths: PathsObject = {
    '/api/auth': { post: loginOperation },
    '/api/auth/refresh-token': { post: refreshTokenOperation },
    '/api/auth/role': { get: getRoleOperation },
    '/api/auth/change-password': { patch: changePasswordOperation }
}

export default authPaths
