import { OperationObject, PathsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const createOperation: OperationObject = {
    tags: ['domain'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Create domain',
    operationId: 'create',
    parameters: [],
    requestBody: {
        required: true,
        description: 'Domain information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/DomainValidator'
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
    tags: ['domain'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get all domain',
    operationId: 'getAll',
    parameters: [],
    responses: {
        '200': {
            description: ''
        }
    }
}

const updateOperation: OperationObject = {
    tags: ['domain'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Update domain',
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
        description: 'Domain information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/DomainValidator'
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
    tags: ['domain'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Delete domain',
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

const domainPaths: PathsObject = {
    '/api/domain': { post: createOperation, get: getAllOperation },
    '/api/domain/{id}': { patch: updateOperation, delete: deleteOperation }
}

export default domainPaths
