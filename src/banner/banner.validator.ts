import { Type } from 'class-transformer'
import { Allow, IsArray, IsBoolean, IsMongoId, IsOptional, Matches } from 'class-validator'
import { Image } from 'src/post/post.validator'

/**
 * Banner Validator
 * @author KhoaVD
 */
export class BannerValidator {
    @Matches(/^(([\p{L}|0-9]+\s)*[\p{L}|0-9])*$/u, { message: 'Tiêu đề không được chứa ký tự đặc biệt !' })
    @IsOptional()
    title: string

    @Matches(/^(([\p{L}|0-9]+\s)*[\p{L}|0-9])*$/u, { message: 'Tiêu đề không được chứa ký tự đặc biệt !' })
    @IsOptional()
    titleEn: string

    @Allow()
    description: string

    @Allow()
    descriptionEn: string

    @Allow()
    @Type(() => Image)
    image: Image

    @IsBoolean()
    @IsOptional()
    isShow: boolean

    @Allow()
    language: string
}

export class SortBannerValidator {
    @IsArray()
    @IsMongoId({ each: true })
    ids: string[]
}
