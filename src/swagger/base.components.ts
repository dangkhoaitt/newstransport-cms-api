import { ComponentsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import AuthSchema, { ChangePasswordSchema, RefreshTokenSchema } from './auth.schema'
import BannerSchema from './banner.schema'
import { ImageSchema } from './base.schema'
import BillSchema from './bill.schema'
import { CategorySchema, UpdateCategorySchema } from './category.schema'
import CustomerSchema, { UpdateCustomerSchema } from './customer.schema'
import DomainSchema from './domain.schema'
import PostSchema, { PostSeoSchema } from './post.schema'
import MainPricingSchema from './pricingService.schema'
import ServiceSchema, { SubServiceSchema, UpdateSubServiceSchema } from './service.schema'
import SettingSchema from './setting.schema'
import { InsertUserSchema, UpdateUserSchema } from './user.schema'

const components: ComponentsObject = {
    securitySchemes: {
        bearer: {
            scheme: 'bearer',
            bearerFormat: 'JWT',
            type: 'http'
        }
    },
    schemas: {
        AuthRequest: AuthSchema,
        ChangePasswordValidator: ChangePasswordSchema,
        RefreshTokenRequest: RefreshTokenSchema,
        Seo: PostSeoSchema,
        Image: ImageSchema,
        PostValidator: PostSchema,
        BannerValidator: BannerSchema,
        InsertUserValidator: InsertUserSchema,
        UpdateUserValidator: UpdateUserSchema,
        CategoryValidator: CategorySchema,
        UpdateCategoryValidator: UpdateCategorySchema,
        CustomerValidator: CustomerSchema,
        UpdateCustomerValidator: UpdateCustomerSchema,
        SettingValidator: SettingSchema,
        ServiceValidator: ServiceSchema,
        UpdateSubServiceValidator: UpdateSubServiceSchema,
        SubServiceValidator: SubServiceSchema,
        PricingValidator: MainPricingSchema,
        BillValidator: BillSchema,
        DomainValidator: DomainSchema
    }
}

export default components
