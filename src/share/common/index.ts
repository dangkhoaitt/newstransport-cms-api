import { ObjectId } from 'mongodb'
import { BooleanString } from '../types'

export function isNullOrUndefined(param: unknown): boolean {
    return param === undefined || param === null
}

export function isUndefined(param: unknown): boolean {
    return param === undefined
}

export function isStringEmpty(val: string): boolean {
    return isNullOrUndefined(val) || typeof val !== 'string' || val.length === 0 || val.trim().length === 0
}

export function isObjectEmpty(obj: object): boolean {
    return isNullOrUndefined(obj) || typeof obj !== 'object' || Object.keys(obj).length === 0
}

export function isArrayEmpty(arr: unknown[]): boolean {
    return isNullOrUndefined(arr) || !Array.isArray(arr) || arr.length === 0
}

export function isTrue(val: BooleanString): boolean {
    return val === 'true' || val === '1'
}

export function flattenArrays(arr: string[]): string[] {
    return arr.reduce(function(previous, currentElement) {
        return previous.concat(Array.isArray(currentElement) ? flattenArrays(currentElement) : currentElement)
    }, [])
}

export function parseMongoId(ids: string[]): ObjectId[] {
    return (ids || []).map(id => new ObjectId(id))
}

export function arrayToObjects<T>(arr: T[], key: keyof T, value?: keyof T): object {
    return arr.reduce((obj, item) => {
        obj[`${item[key]}`] = value ? item[value] : item
        return obj
    }, {})
}

export function removeUndefinedProperty(object: object): void {
    Object.keys(object).forEach(key => (object[key] === undefined ? delete object[key] : {}))
}

//normalize('NFD') Return the Unicode normal form for the string
//replace(/[\u0300-\u036f]/g, '') remove diacriticals from string
//replace(/[^0-9a-zA-Z/ /]+/g, ' ') Non-lantin and non-number will be replace with space
export function latinizeString(str: string): string {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^0-9a-zA-Z/ /]+/g, ' ')
        .trim()
        .replace(/ +/g, '-')
        .toLowerCase()
}

export function extractHostname(url: string, options: { keepProtocol?: boolean } = {}): string {
    const { keepProtocol = false } = options
    let hostname: string

    //find & remove protocol (http, ftp, etc.) and get hostname
    if (url.indexOf('//') > -1) {
        const hostParts = url.split('/')
        if (keepProtocol) {
            hostname = hostParts[0] + '//' + hostParts[2]
        } else {
            hostname = url.split('/')[2]
        }
    } else {
        hostname = url.split('/')[0]
    }

    // find & remove port number
    const hostSplitByDelimiter = hostname.split(':')
    if (!isNaN(+hostSplitByDelimiter[hostSplitByDelimiter.length - 1])) {
        hostSplitByDelimiter.pop()
    }
    hostname = hostSplitByDelimiter.join(':')
    //find & remove "?"
    hostname = hostname.split('?')[0]

    return hostname
}
