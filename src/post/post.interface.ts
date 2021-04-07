import { ObjectId } from 'mongodb'
import { BaseInterface } from 'src/share/interfaces/base.interface'

/**
 * Post Interface
 * @author KhoaVD
 */
export interface Post extends BaseInterface {
    title: string
    categoryId: ObjectId
    categoryName: string
    description: string
    seo?: Seo
    content: string
    thumbnail?: Image
    images?: Image[]
    domainIds?: ObjectId[]
    tags?: string
    isShow: boolean
    slug: string
    tagSlug: string[]
}

type Image = {
    url: string
    thumbUrl: string
    mediumUrl: string
    alt: string
}

type Seo = {
    title: string
    description: string
    keywords: string
}
