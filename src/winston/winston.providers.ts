import { Provider, Type } from '@nestjs/common'
import { join } from 'path'
import { createLogger, Logger, LoggerOptions, transports } from 'winston'
import 'winston-daily-rotate-file'
import { WinstonLogger } from './winston.classes'
import { WINSTON_MODULE_CONFIG, WINSTON_MODULE_OPTIONS, WINSTON_MODULE_PROVIDER } from './winston.contants'
import { WinstonModuleAsyncOptions, WinstonModuleOptions, WinstonModuleOptionsFactory } from './winston.interfaces'
import { getLoggerToken } from './winston.utils'

async function createWinstonModuleOptions(optionsFactory: WinstonModuleOptionsFactory): Promise<WinstonModuleOptions> {
    return await optionsFactory.createWinstonModuleOptions()
}

function createWinstonProvider(loggerOpts: LoggerOptions): Logger {
    return createLogger(loggerOpts)
}

export function createWinstonAsyncProviders(options: WinstonModuleAsyncOptions): Provider[] {
    const providers: Provider[] = [
        {
            provide: WINSTON_MODULE_PROVIDER,
            useFactory: createWinstonProvider,
            inject: [WINSTON_MODULE_OPTIONS]
        }
    ]

    if (options.useClass) {
        const useClass = options.useClass as Type<WinstonModuleOptionsFactory>
        providers.push(
            ...[
                {
                    provide: WINSTON_MODULE_OPTIONS,
                    useFactory: createWinstonModuleOptions,
                    inject: [WINSTON_MODULE_CONFIG]
                },
                {
                    provide: WINSTON_MODULE_CONFIG,
                    useClass
                }
            ]
        )
    }

    if (options.useFactory) {
        providers.push({
            provide: WINSTON_MODULE_OPTIONS,
            useFactory: options.useFactory,
            inject: options.inject || []
        })
    }

    return providers
}

export function createWinstonFileTransportProviders(collection: string): Provider[] {
    return [
        {
            provide: getLoggerToken(collection),
            useFactory: async function(
                logger: Logger,
                optionsFactory: WinstonModuleOptionsFactory
            ): Promise<WinstonLogger> {
                process.env.NODE_ENV === 'production' &&
                    logger.add(
                        new transports.File({
                            level: 'info',
                            filename: join(optionsFactory.logPath, `${collection}.query.log`)
                        })
                    )
                return new WinstonLogger(logger)
            },
            inject: [WINSTON_MODULE_PROVIDER, WINSTON_MODULE_CONFIG]
        }
    ]
}

export function createWinstonDailyRotateFileTransportProviders(collection: string): Provider[] {
    return [
        {
            provide: getLoggerToken(collection),
            useFactory: async function(
                optionsFactory: WinstonModuleOptionsFactory,
                loggerOptions: LoggerOptions
            ): Promise<WinstonLogger> {
                const logger = createWinstonProvider(loggerOptions)
                if (process.env.NODE_ENV === 'production') {
                    logger.add(
                        new transports.DailyRotateFile({
                            level: 'info',
                            dirname: join(optionsFactory.logPath, '%DATE%'),
                            filename: `${collection}.query.log`,
                            datePattern: 'DD-MM-YYYY'
                        })
                    )
                }
                return new WinstonLogger(logger)
            },
            inject: [WINSTON_MODULE_CONFIG, WINSTON_MODULE_OPTIONS]
        }
    ]
}
