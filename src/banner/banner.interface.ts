import { Image } from 'src/post/post.validator'
import { BaseInterface } from 'src/share/interfaces/base.interface'

export interface Banner extends BaseInterface {
    title?: string
    description?: string
    image: Image
    order: number
    isShow: boolean
    language: string
}
