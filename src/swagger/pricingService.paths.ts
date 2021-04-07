import { OperationObject, PathsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const createMainPricingOperation: OperationObject = {
    tags: ['pricing-service'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Create Pricing',
    operationId: 'create',
    parameters: [],
    requestBody: {
        required: true,
        description: 'Service information',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/PricingValidator'
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

const updateOnePricingOperation: OperationObject = {
    tags: ['pricing-service'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Update Pricing',
    operationId: 'update',
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
    requestBody: {
        required: true,
        description: 'Service information',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        price: { type: 'number' },
                        note: { type: 'string' }
                    },
                    required: ['price']
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

const deleteOnePricingOperation: OperationObject = {
    tags: ['pricing-service'],
    security: [
        {
            bearer: []
        }
    ],
    summary: 'Delete Pricing',
    operationId: 'delete',
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

const pricingServicePaths: PathsObject = {
    '/api/service/pricing': {
        post: createMainPricingOperation,
        patch: updateOnePricingOperation,
        delete: deleteOnePricingOperation
    }
}

export default pricingServicePaths
