import { DynamicModule, Module } from '@nestjs/common'
import { CollectionList } from 'src/share/constants/collection.constant'
import { WinstonModuleAsyncOptions } from './winston.interfaces'
import {
    createWinstonAsyncProviders,
    createWinstonDailyRotateFileTransportProviders,
    createWinstonFileTransportProviders
} from './winston.providers'

@Module({})
export class WinstonModule {
    static forRootAsync(options: WinstonModuleAsyncOptions): DynamicModule {
        const providers = createWinstonAsyncProviders(options)

        return {
            global: true,
            module: WinstonModule,
            imports: options.imports,
            providers: providers,
            exports: providers
        } as DynamicModule
    }

    static useLogger(collection: CollectionList): DynamicModule {
        const providers = createWinstonFileTransportProviders(collection)

        return {
            module: WinstonModule,
            providers: providers,
            exports: providers
        }
    }

    static useServiceLogger(key: string): DynamicModule {
        const providers = createWinstonDailyRotateFileTransportProviders(key)

        return {
            module: WinstonModule,
            providers: providers,
            exports: providers
        }
    }
}
