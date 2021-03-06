import { BaseInterface } from 'src/share/interfaces/base.interface'

/**
 * Truck Interface
 * @author KhoaVD
 */
export interface Truck extends BaseInterface {
    code: string
    name: string
    order: number
}
