import { BaseInterface } from 'src/share/interfaces/base.interface'
import { Role } from './user.constant'

/**
 * User Interface
 * @author KhoaVD
 */
export interface User extends BaseInterface {
    id?: string
    code: string
    username: string
    password?: string
    name: string
    nameSearch: string
    birthday?: string
    tel: string
    telSearch: string
    address?: string
    email?: string
    role: Role
    unit: { code: string; name: string }
}
