import { OperationObject, PathsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const createOperation: OperationObject = {
    tags: ['category'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Create category',
    operationId: 'create',
    parameters: [],
    requestBody: {
        required: true,
        description: 'Category information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/CategoryValidator'
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
    tags: ['category'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get all category',
    operationId: 'getAll',
    parameters: [
        {
            name: 'page',
            in: 'query',
            schema: { type: 'string' },
            required: false
        },
        {
            name: 'language',
            in: 'query',
            schema: { type: 'string' },
            required: false
        },
        {
            name: 'name',
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
            name: 'isParent',
            in: 'query',
            schema: { type: 'boolean' },
            required: false
        },
        {
            name: 'show',
            in: 'query',
            schema: { type: 'boolean' },
            required: false
        },
        {
            name: 'type',
            in: 'query',
            schema: { type: 'string' },
            required: false
        },
        {
            name: 'dropdown',
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
    tags: ['category'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get detail category',
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
    tags: ['category'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Update category',
    operationId: 'update',
    parameters: [{ name: 'id', in: 'path', schema: { type: 'string' }, required: false }],
    requestBody: {
        required: true,
        description: 'Category information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/UpdateCategoryValidator'
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
    tags: ['category'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Delete category',
    operationId: 'delete',
    parameters: [
        {
            name: 'id',
            in: 'path',
            schema: { type: 'string' },
            required: true
        },
        {
            name: 'language',
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

const categoryPaths: PathsObject = {
    '/api/category': { post: createOperation, get: getAllOperation },
    '/api/category/{id}': { get: getDetailOperation, patch: updateOperation, delete: deleteOperation }
}

export default categoryPaths
