import { Type } from '@nestjs/common'
import { Abstract, ModuleMetadata } from '@nestjs/common/interfaces'
import { LoggerOptions } from 'winston'

export type WinstonModuleOptions = LoggerOptions

export interface WinstonModuleOptionsFactory {
    readonly logPath: string
    createWinstonModuleOptions(): Promise<WinstonModuleOptions> | WinstonModuleOptions
}

export interface WinstonModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    useFactory?: (...args: unknown[]) => Promise<WinstonModuleOptions> | WinstonModuleOptions
    inject?: Array<Type<unknown> | string | symbol | Abstract<unknown> | Function>
    useClass?: Type<WinstonModuleOptionsFactory>
}
