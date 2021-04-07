import { Role } from 'src/user/user.constant'

export interface AuthUser {
    userId: string
    username: string
    name: string
    unit: { code: string; name: string }
    role: Role
}
