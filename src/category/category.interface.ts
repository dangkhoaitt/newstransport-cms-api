import { ObjectId } from 'mongodb'
import { BaseInterface } from 'src/share/interfaces/base.interface'

/**
 * Category Interface
 * @author KhoaVD
 */

export enum CategoryType {
    'single' = 1,
    'multi' = 2
}
export interface Category extends BaseInterface {
    name: string
    name_en: string
    parentId?: ObjectId
    parentName: string
    type: CategoryType
    isShow: boolean
    slug: string
    order: number
}
