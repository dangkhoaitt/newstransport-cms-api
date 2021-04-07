import { OperationObject, PathsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const createOperation: OperationObject = {
    tags: ['banner'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Create banner',
    operationId: 'create',
    parameters: [],
    requestBody: {
        required: true,
        description: 'Banner information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/BannerValidator'
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
    tags: ['banner'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get all banner',
    operationId: 'getAll',
    parameters: [],
    responses: {
        '200': {
            description: 'Get all banner sort by ascending "order" and "insertTime"'
        }
    }
}

const getDetailOperation: OperationObject = {
    tags: ['banner'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Get detail banner',
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

const sortOperation: OperationObject = {
    tags: ['banner'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Sort banner',
    operationId: 'sort',
    parameters: [],
    requestBody: {
        required: true,
        description: 'Banner information',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        ids: {
                            type: 'array'
                        }
                    },
                    required: ['ids'],
                    example: {
                        ids: ['string']
                    }
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

const updateOperation: OperationObject = {
    tags: ['banner'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Update banner',
    operationId: 'update',
    parameters: [],
    requestBody: {
        required: true,
        description: 'Banner information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/BannerValidator'
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
    tags: ['banner'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Delete banner',
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
        '204': {
            description: ''
        }
    }
}

const bannerPaths: PathsObject = {
    '/api/banner': { post: createOperation, get: getAllOperation, patch: sortOperation },
    '/api/banner/{id}': { get: getDetailOperation, patch: updateOperation, delete: deleteOperation }
}

export default bannerPaths
