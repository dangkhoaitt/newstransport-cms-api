import { BaseInterface } from 'src/share/interfaces/base.interface'

/**
 * Package Interface
 * @author Khoa
 */
export interface Package extends BaseInterface {
    code: string
    name: string
    order: number
}
