import { BaseInterface } from 'src/share/interfaces/base.interface'
import { Unit } from 'src/unit/unit.interface';

/**
 * Province Interface
 * @author Thuan
 */
export interface Province extends BaseInterface, District {
    district?: District[]
}

interface District {
    code: number
    name: string
    unit?: Unit
}
