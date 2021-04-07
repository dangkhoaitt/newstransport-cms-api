import { OperationObject, PathsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const createOperator: OperationObject = {
    tags: ['user'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Create user',
    operationId: 'create',
    parameters: [],
    requestBody: {
        required: true,
        description: 'User information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/InsertUserValidator'
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

const getAllOperator: OperationObject = {
    tags: ['user'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get all user',
    operationId: 'getAll',
    parameters: [
        {
            name: 'page',
            in: 'query',
            schema: { type: 'number' },
            required: false
        },
        {
            name: 'name',
            in: 'query',
            schema: { type: 'string' },
            required: false
        },
        {
            name: 'email',
            in: 'query',
            schema: { type: 'string' },
            required: false
        },
        {
            name: 'tel',
            in: 'query',
            schema: { type: 'string' },
            required: false
        },
        {
            name: 'role',
            in: 'query',
            schema: { type: 'string' },
            required: false
        }
    ],
    responses: {
        '200': {
            description: ''
        }
    }
}

const getDetailOperator: OperationObject = {
    tags: ['user'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get user detail',
    operationId: 'getDetail',
    parameters: [
        {
            name: 'id',
            in: 'path',
            schema: { type: 'string' },
            required: true
        }
    ],
    responses: {
        '201': {
            description: ''
        }
    }
}

const updateOperation: OperationObject = {
    tags: ['user'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Update user',
    operationId: 'update',
    parameters: [
        {
            name: 'id',
            in: 'path',
            schema: { type: 'string' },
            required: true
        }
    ],
    requestBody: {
        required: true,
        description: 'User information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/UpdateUserValidator'
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

const deleteOperation: OperationObject = {
    tags: ['user'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Delete user',
    operationId: 'delete',
    parameters: [
        {
            name: 'id',
            in: 'path',
            schema: { type: 'string' },
            required: true
        }
    ],
    responses: {
        '201': {
            description: ''
        }
    }
}

const userPaths: PathsObject = {
    '/api/user': { post: createOperator, get: getAllOperator },
    '/api/user/{id}': { get: getDetailOperator, patch: updateOperation, delete: deleteOperation }
}

export default userPaths
