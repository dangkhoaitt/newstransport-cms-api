import { OperationObject, PathsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const createOperation: OperationObject = {
    tags: ['post'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Create post',
    operationId: 'create',
    parameters: [],
    requestBody: {
        required: true,
        description: 'Post information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/PostValidator'
                }
            }
        }
    },
    responses: {
        '200': {
            description: 'success'
        }
    }
}

const getAllOperation: OperationObject = {
    tags: ['post'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get all post',
    operationId: 'getAll',
    parameters: [
        {
            name: 'page',
            in: 'query',
            schema: { type: 'number' },
            required: false
        },
        {
            name: 'title',
            in: 'query',
            schema: { type: 'string' },
            required: false
        },
        {
            name: 'insertBy',
            in: 'query',
            schema: { type: 'string' },
            required: false
        },
        {
            name: 'show',
            in: 'query',
            schema: { type: 'string' },
            required: false
        },
        {
            name: 'categoryId',
            in: 'query',
            schema: { type: 'string' },
            required: false
        },
        {
            name: 'lang',
            in: 'query',
            schema: { type: 'string' },
            required: false
        }
    ],
    responses: {
        '201': {
            description: ''
        }
    }
}

const getDetailOperation: OperationObject = {
    tags: ['post'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get detail post',
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
    tags: ['post'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Update post',
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
        description: 'Post information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/PostValidator'
                }
            }
        }
    },
    responses: {
        '200': {
            description: ''
        }
    }
}

const deleteOperation: OperationObject = {
    tags: ['post'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Delete post',
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

const postPaths: PathsObject = {
    '/api/post': { post: createOperation, get: getAllOperation },
    '/api/post/{id}': { get: getDetailOperation, patch: updateOperation, delete: deleteOperation }
}

export default postPaths
