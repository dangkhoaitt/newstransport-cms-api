import { BaseInterface } from 'src/share/interfaces/base.interface'

/**
 * Service Interface
 * @author KhoaVD
 */
export interface Service extends BaseInterface {
    code: string
    name: string
    isFix: boolean
    isDistance: boolean
    isWeight: boolean
    istruck: boolean
    show: boolean
    isExtra: boolean
    weightUnit: number
}
