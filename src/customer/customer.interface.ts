import { BaseInterface } from 'src/share/interfaces/base.interface'

/**
 * Customer Interface
 * @author KhoaVD
 */
export interface Customer extends BaseInterface {
    code: string
    name: string
    tel: string
    address: string
    province: { code: number; name: string }
    district: { code: number; name: string }
}
