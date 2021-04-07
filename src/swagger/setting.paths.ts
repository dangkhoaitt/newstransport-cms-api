import { OperationObject, PathsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const createOperation: OperationObject = {
    tags: ['setting'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Create setting',
    operationId: 'create',
    parameters: [],
    requestBody: {
        required: true,
        description: 'Setting information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/SettingValidator'
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
    tags: ['setting'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get all setting',
    operationId: 'getAll',
    parameters: [],
    responses: {
        '201': {
            description: ''
        }
    }
}

const getDetailOperation: OperationObject = {
    tags: ['setting'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get detail setting',
    operationId: 'getDetail',
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

const updateOperation: OperationObject = {
    tags: ['setting'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Update setting',
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
        description: 'Setting information',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        isActive: {
                            type: 'boolean'
                        }
                    },
                    required: ['isActive']
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

const deleteOperation: OperationObject = {
    tags: ['setting'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Delete setting',
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
        '200': {
            description: 'success'
        }
    }
}

const deleteSubOperation: OperationObject = {
    tags: ['setting'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Delete Sub Setting',
    operationId: 'delete-sub',
    parameters: [
        {
            name: 'code',
            in: 'path',
            schema: { type: 'string' },
            required: true
        }
    ],
    responses: {
        '200': {
            description: 'success'
        }
    }
}

const settingPaths: PathsObject = {
    '/api/setting': { post: createOperation, get: getAllOperation },
    '/api/setting/{code}': { get: getDetailOperation, patch: updateOperation, delete: deleteOperation },
    '/api/setting/sub-setting/{code}': { delete: deleteSubOperation }
}

export default settingPaths
