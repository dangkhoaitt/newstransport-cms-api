import { BaseInterface } from 'src/share/interfaces/base.interface'

/**
 * Quote Interface
 * @author Thuan
 */
export interface Quote extends BaseInterface {
    name: string
    tel: string
    email: string
    content: string
    status: number
}
