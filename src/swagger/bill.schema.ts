import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const CustomerInfo: SchemaObject = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        address: { type: 'string' },
        tel: { type: 'string' }
    }
}

const BillSchema: SchemaObject = {
    type: 'object',
    properties: {
        customerCode: { type: 'string' },
        billCode: { type: 'string' },
        customerInfo: CustomerInfo,
        recipientInfo: CustomerInfo,
        goodsContent: { type: 'string' },
        packageQuantity: { type: 'number' },
        weight: { type: 'number' },
        mainService: { type: 'string' },
        extraService: { type: 'array', items: { type: 'string' } },
        accountingSettings: { type: 'array', items: { type: 'string' } },
        statusSettings: { type: 'array', items: { type: 'string' } }
    },
    required: [
        'customerCode',
        'billCode',
        'customerInfo',
        'recipientInfo',
        'goodsContent',
        'packageQuantity',
        'weight',
        'mainService'
    ]
}

export default BillSchema
