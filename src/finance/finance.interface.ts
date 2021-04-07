import { BaseInterface } from 'src/share/interfaces/base.interface'

/**
 * Finance Interface
 * @author Thuan
 */
export interface Finance extends BaseInterface {
    code: string
    name: string
    order: number
}
