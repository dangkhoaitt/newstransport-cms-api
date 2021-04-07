import { format, transports } from 'winston'
import { WinstonModuleOptions, WinstonModuleOptionsFactory } from './winston.interfaces'
import EJSON = require('mongodb-extended-json')

export class WinstonConfigService implements WinstonModuleOptionsFactory {
    public readonly logPath = process.env.LOG_DIR_PATH || 'logs'
    private label = 'WinstonLogger'
    private timestampFormat = 'MM/DD/YYYY HH:mm:ss'

    createWinstonModuleOptions(): WinstonModuleOptions {
        const formatTemplate = format.printf(({ label, timestamp, level, message, context, request, meta }) => {
            return `[${label}] - ${timestamp} ${level} [${context}]: ${message} ${JSON.stringify(
                request
            )}\n${EJSON.stringify(meta)}`
        })

        return {
            format: format.combine(
                format.label({ label: this.label }),
                format.timestamp({ format: this.timestampFormat }),
                formatTemplate
            ),
            transports: [new transports.Console()]
        }
    }
}
