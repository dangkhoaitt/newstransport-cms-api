import * as dayjs from 'dayjs'
import * as customParseFormat from 'dayjs/plugin/customParseFormat'
import * as moment from 'moment'
import { DateFormat, VI_DATE_FORMAT } from '../constants/date-format.constant'

dayjs.extend(customParseFormat)

interface Options {
    dateString: string
    format?: DateFormat
    isEndOfDay?: boolean
}
export function getTimeFromDateString(options: Options): number {
    const { dateString, format = VI_DATE_FORMAT, isEndOfDay } = options
    let date = dayjs(dateString, format)
    if (isEndOfDay) date = date.endOf('day')
    return date.toDate().getTime()
}

/**
 * This function check date format (DD/MM/YYYY)
 *
 * @param date
 * @returns boolean
 */
export function CheckDate(date: string): boolean {
    if (date === 'Invalid Date') return false
    return dayjs(date, VI_DATE_FORMAT).format(VI_DATE_FORMAT) === date
}

/**
 * Get current timestamp with extra seconds
 *
 * @param seconds
 * @returns time in miliseconds
 */
export function getExtraTime(seconds: string): number {
    return dayjs()
        .add(parseInt(seconds), 's')
        .toDate()
        .getTime()
}

export function timestampToDateStr(timestamp: number, formatter = 'YYYY-MM-DD'): string {
    return moment.unix(timestamp).format(formatter)
}