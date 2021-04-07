import { RequestHelper } from 'src/share/helpers/request.helper'
import { Logger } from 'winston'

export class WinstonLogger {
    private context = 'WinstonLogger'

    constructor(private readonly logger: Logger) {}

    public setContext(context: string): void {
        this.context = context
    }

    public log(message: string, meta: { [key: string]: unknown }, context?: string): Logger {
        const req = RequestHelper.getRequest()
        if (req) {
            const { method, url, params, query, body } = req
            return this.logger.info(message, {
                context: context || this.context,
                request: { method, url, params, query, body },
                meta
            })
        }
    }

    public error(message: string, trace?: string, context?: string): Logger {
        return this.logger.error(message, { trace, context: context || this.context })
    }

    public warn(message: string, context?: string): Logger {
        return this.logger.warn(message, { context: context || this.context })
    }

    public debug?(message: string, context?: string): Logger {
        return this.logger.debug(message, { context: context || this.context })
    }

    public verbose?(message: string, context?: string): Logger {
        return this.logger.verbose(message, { context: context || this.context })
    }
}
