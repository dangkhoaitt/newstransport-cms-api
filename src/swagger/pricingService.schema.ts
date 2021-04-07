import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

const MainPricingSchema: SchemaObject = {
    type: 'object',
    properties: {
        serviceCode: { type: 'string' },
        subServiceCode: { type: 'string' },
        provinceCode: { type: 'string' },
        districtCode: { type: 'string' },

        price: { type: 'number' },
        note: { type: 'string' }
    },
    required: ['serviceCode', 'subServiceCode', 'price']
}

export default MainPricingSchema
