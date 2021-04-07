import { OperationObject, PathsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const createMainServiceOperation: OperationObject = {
    tags: ['service'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Create Main Service',
    operationId: 'createMain',
    parameters: [],
    requestBody: {
        required: true,
        description: 'Service information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/ServiceValidator'
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

const createSubServiceOperation: OperationObject = {
    tags: ['service'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Create Sub Service',
    operationId: 'createSub',
    parameters: [],
    requestBody: {
        required: true,
        description: 'Service information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/SubServiceValidator'
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
    tags: ['service'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get Many Service',
    operationId: 'getMany',
    parameters: [
        {
            name: 'type',
            in: 'query',
            schema: { type: 'string' },
            required: false
        },
        {
            name: 'page',
            in: 'query',
            schema: { type: 'number' },
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
    tags: ['service'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get One Service',
    operationId: 'getOne',
    parameters: [
        {
            name: 'code',
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

const updateServiceOperation: OperationObject = {
    tags: ['service'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Update Service',
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
        description: 'Service information',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' }
                    },
                    required: ['name']
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

const updateSubServiceOperation: OperationObject = {
    tags: ['service'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Update Sub Service',
    operationId: 'updateSub',
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
        description: 'Service information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/UpdateSubServiceValidator'
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
    tags: ['service'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Delete Service',
    operationId: 'delete',
    parameters: [
        {
            name: 'code',
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

const servicePaths: PathsObject = {
    '/api/service': { post: createMainServiceOperation, get: getManyOperation },
    '/api/service/{code}': { get: getOneOperation, patch: updateServiceOperation, delete: deleteOperation },
    '/api/service/sub-service': { post: createSubServiceOperation },
    '/api/service/sub-service/{code}': { patch: updateSubServiceOperation }
}

export default servicePaths
