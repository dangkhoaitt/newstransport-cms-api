import { OperationObject, PathsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const getCustomerOperation: OperationObject = {
    tags: ['bill'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get Customer',
    operationId: 'getCustomer',
    parameters: [
        {
            name: 'code',
            in: 'query',
            schema: { type: 'string' },
            required: false
        },
        {
            name: 'tel',
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

const getServiceOperation: OperationObject = {
    tags: ['bill'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get Service',
    operationId: 'getService',
    parameters: [
        {
            name: 'code',
            in: 'query',
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

const getPricingOperation: OperationObject = {
    tags: ['bill'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get Pricing',
    operationId: 'getPricing',
    parameters: [
        {
            name: 'serviceCode',
            in: 'query',
            schema: { type: 'string' },
            required: true
        },
        {
            name: 'subServiceCode',
            in: 'query',
            schema: { type: 'string' },
            required: true
        },
        {
            name: 'provinceCode',
            in: 'query',
            schema: { type: 'string' },
            required: false
        },
        {
            name: 'districtCode',
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

const getSettingOperation: OperationObject = {
    tags: ['bill'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get Setting',
    operationId: 'getSetting',
    parameters: [
        {
            name: 'code',
            in: 'query',
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

const createOperation: OperationObject = {
    tags: ['bill'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Create Bill',
    operationId: 'create',
    parameters: [],
    requestBody: {
        required: true,
        description: 'Category information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/BillValidator'
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

const getManyOperation: OperationObject = {
    tags: ['bill'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get Many Bill',
    operationId: 'getMany',
    parameters: [
        {
            name: 'page',
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

const getOneOperation: OperationObject = {
    tags: ['bill'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get One Bill',
    operationId: 'getOne',
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

const updateOneOperation: OperationObject = {
    tags: ['bill'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Update One Bill',
    operationId: 'update',
    parameters: [
        {
            name: 'code',
            in: 'path',
            schema: { type: 'string' },
            required: true
        }
    ],
    requestBody: {
        required: true,
        description: 'Bill information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/...'
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

const deleteOneOperation: OperationObject = {
    tags: ['bill'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Delete One Bill',
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

const billPaths: PathsObject = {
    '/api/bill/customer': { get: getCustomerOperation },
    '/api/bill/service': { get: getServiceOperation },
    '/api/bill/pricing': { get: getPricingOperation },
    '/api/bill/setting': { get: getSettingOperation },
    '/api/bill': { post: createOperation, get: getManyOperation },
    '/api/bill/{id}': { get: getOneOperation, patch: updateOneOperation, delete: deleteOneOperation }
}

export default billPaths
