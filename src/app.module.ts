import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { BannerModule } from './banner/banner.module'
import { BillModule } from './bill/bill.module'
import { CategoryModule } from './category/category.module'
import { CustomerModule } from './customer/customer.module'
import { DomainModule } from './domain/domain.module'
import { FinanceModule } from './finance/finance.module'
import { FrontSettingsModule } from './front-settings/front-settings.module'
import { FrontModule } from './front/front.module'
import { JwtRolesAuthGuard } from './guards/jwt-roles.guard'
import { JwtStrategy } from './guards/jwt.strategy'
import { MongodbModule } from './mongodb/mongodb.module'
import { PackageModule } from './package/package.module'
import { PostModule } from './post/post.module'
import { ProgressModule } from './progress/progress.module'
import { ProvinceModule } from './province/province.module'
import { QuoteModule } from './quote/quote.module'
import { ServiceModule } from './service/service.module'
import { RequestBodyMiddleware } from './share/middlewares/request.body.middleware'
import { ExistConstraint } from './share/validator/base.validator'
import { TruckModule } from './truck/truck.module'
import { UnitModule } from './unit/unit.module'
import { UserModule } from './user/user.module'
import { WinstonConfigService } from './winston/winston-config.service'
import { WinstonModule } from './winston/winston.module'

@Module({
    imports: [
        ConfigModule.forRoot(),
        WinstonModule.forRootAsync({ useClass: WinstonConfigService }),
        MongodbModule.forRoot(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            logger: null
        }),
        AuthModule,
        PostModule,
        UserModule,
        CategoryModule,
        CustomerModule,
        BannerModule,
        FrontSettingsModule,
        ProvinceModule,
        ProgressModule,
        FinanceModule,
        PackageModule,
        TruckModule,
        QuoteModule,
        BillModule,
        ServiceModule,
        UnitModule,
        DomainModule,
        FrontModule
    ],
    providers: [
        JwtStrategy,
        {
            provide: APP_GUARD,
            useClass: JwtRolesAuthGuard
        },
        ExistConstraint
    ]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(RequestBodyMiddleware).forRoutes({
            path: '*',
            method: RequestMethod.ALL
        })
    }
}
