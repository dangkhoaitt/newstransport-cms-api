import { BaseInterface } from 'src/share/interfaces/base.interface'

/**
 * Package Interface
 * @author KhoaVD
 */
export interface Package extends BaseInterface {
    code: string
    name: string
    order: number
}
