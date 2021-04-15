import { BaseInterface } from 'src/share/interfaces/base.interface'

/**
 * Unit Interface
 * @author KhoaVD
 */
export interface Unit extends BaseInterface {
    code: string
    name: string
    order: number
}
