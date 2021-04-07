import { BadRequestException, Optional, ValidationPipe, ValidationPipeOptions } from '@nestjs/common'
import { ValidationError } from 'class-validator'

/**
 * MainValidationPipe
 *
 * @author CuongNQ
 */

interface MainValidationPipeOptions extends ValidationPipeOptions {
    includeValue?: boolean
}

export class MainValidationPipe extends ValidationPipe {
    private includeValue: boolean

    constructor(@Optional() { includeValue = false, ...validationPipeOptions }: MainValidationPipeOptions = {}) {
        super({ whitelist: true, ...validationPipeOptions })
        this.includeValue = includeValue
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exceptionFactory: any = (errors: ValidationError[]) => {
        const transformedErrors = errors
            .map(error => this.mapChildren(error))
            .reduce((previousErrors, currentError) => [...previousErrors, ...currentError], [])
            .filter(error => !!Object.keys(error.constraints).length)
            .map(error => ({
                field: error.property,
                value: this.includeValue ? error.value : undefined,
                message: Object.values(error.constraints)[0]
            }))

        throw new BadRequestException(transformedErrors)
    }

    private mapChildren(error: ValidationError): ValidationError[] {
        if (!(error.children && error.children.length)) {
            return [error]
        }
        const validationErrors = []
        for (const item of error.children) {
            if (item.children && item.children.length) {
                validationErrors.push(...this.mapChildren(item))
            }
            validationErrors.push(this.prependConstraints(item))
        }
        return validationErrors
    }

    private prependConstraints(error: ValidationError): ValidationError {
        const constraints = {}
        for (const key in error.constraints) {
            constraints[key] = error.constraints[key]
        }
        return { ...error, constraints }
    }
}
