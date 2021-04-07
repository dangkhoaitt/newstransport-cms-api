import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { isArray, isNullOrUndefined, isObject } from 'util'
import { RequestHelper } from '../helpers/request.helper'

function transformUnderscoreIdToId(value: Record<string, unknown>): Record<string, unknown> {
    if (!value) return value
    if (!isNullOrUndefined(value._id)) {
        value.id = value._id
        value._id = undefined
    }
    for (const key in value) {
        const subElement = value[key]
        if (Array.isArray(subElement)) {
            subElement.forEach(transformUnderscoreIdToId)
        }
    }
    return value
}

/**
 * Transform Response Interceptor
 *
 * @author CuongNQ
 */
@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const ctx = context.switchToHttp()
        const req = ctx.getRequest()

        RequestHelper.setRequest(req)

        return next.handle().pipe(
            tap(() => RequestHelper.clear()),
            map(data => {
                if (isNullOrUndefined(data)) return { status: HttpStatus.NO_CONTENT, message: 'success' }
                const { data: dataList, totalRecords } = data
                if (isArray(data)) {
                    data = data.map(transformUnderscoreIdToId)
                } else if (isObject(data)) {
                    transformUnderscoreIdToId(data)
                    if (!isNullOrUndefined(dataList) && isArray(dataList)) {
                        data = dataList.map(transformUnderscoreIdToId)
                    }
                }
                return {
                    status: 0,
                    message: 'success',
                    data,
                    totalRecords
                }
            })
        )
    }
}
