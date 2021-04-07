import { ObjectId } from 'mongodb'
import { AuthUser } from 'src/auth/interfaces/auth-user.interface'

export interface BaseInterface {
    _id: ObjectId
    id?: string
    insertTime?: number
    updateTime?: number
    deleteTime?: number | Record<string, unknown>
}

export interface UpdateHistory {
    changedData: object
    updateBy: ObjectId | string | Partial<AuthUser>
}

export interface InsertBy {
    userId: string
    username: string
    name: string
}

export interface Counter {
    _id: ObjectId
    code: string
    seq: number
}
