import { Inject } from '@nestjs/common'
import { getLoggerToken } from './winston.utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function InjectLogger(key: string): any {
    return Inject(getLoggerToken(key))
}
