import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const CustomerSchema: SchemaObject = {
    type: 'object',
    properties: {
        name: {
            type: 'string'
        },
        idCode: {
            type: 'string'
        },
        tel: {
            type: 'string'
        },
        address: {
            type: 'string'
        },
        type: {
            type: 'string'
        },
        email: {
            type: 'string'
        },
        representative: {
            type: 'string'
        },
        invoiceAddress: {
            type: 'string'
        },
        tax: {
            type: 'string'
        }
    },
    required: ['name', 'tel', 'address', 'type', 'representative', 'invoiceAddress', 'tax']
}

export const UpdateCustomerSchema: SchemaObject = {
    type: 'object',
    properties: {
        name: {
            type: 'string'
        },
        idCode: {
            type: 'string'
        },
        tel: {
            type: 'string'
        },
        address: {
            type: 'string'
        },
        email: {
            type: 'string'
        },
        representative: {
            type: 'string'
        },
        invoiceAddress: {
            type: 'string'
        },
        tax: {
            type: 'string'
        }
    },
    required: ['name', 'tel', 'address']
}

export default CustomerSchema
