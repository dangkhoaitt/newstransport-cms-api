import { OperationObject, PathsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const createOperation: OperationObject = {
    tags: ['customer'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Create customer',
    operationId: 'create',
    parameters: [],
    requestBody: {
        required: true,
        description: 'Customer information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/CustomerValidator'
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
    tags: ['customer'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get all customer',
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
            name: 'code',
            in: 'query',
            schema: { type: 'string' },
            required: false
        },
        {
            name: 'type',
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
    tags: ['customer'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get detail customer',
    operationId: 'getDetail',
    parameters: [
        {
            name: 'code',
            in: 'path',
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

const updateOperation: OperationObject = {
    tags: ['customer'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Update customer',
    operationId: 'update',
    parameters: [{ name: 'code', in: 'path', schema: { type: 'string' }, required: true }],
    requestBody: {
        required: true,
        description: 'Customer information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/UpdateCustomerValidator'
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
    tags: ['customer'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Delete customer',
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

const customerPaths: PathsObject = {
    '/api/customer': { post: createOperation, get: getAllOperation },
    '/api/customer/{code}': { get: getDetailOperation, patch: updateOperation, delete: deleteOperation }
}

export default customerPaths
