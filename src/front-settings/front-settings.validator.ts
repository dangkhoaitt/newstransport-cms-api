import { Allow, IsArray, IsEmail, IsIn, IsNotEmpty, IsString, IsUrl } from 'class-validator'

type UrlOptions = {
    host_whitelist: string[]
    require_host: boolean
}

function urlCommonOptions(url: string): UrlOptions {
    return {
        // eslint-disable-next-line @typescript-eslint/camelcase
        host_whitelist: [`https://www.${url}`, `www.${url}`, `https://${url}`, url],
        // eslint-disable-next-line @typescript-eslint/camelcase
        require_host: true
    }
}

export class Partner {
    @Allow()
    @IsUrl()
    image: string

    @Allow()
    @IsString()
    name: string

    @Allow()
    @IsUrl()
    url: string
}

export class Title {
    @Allow()
    @IsString()
    above: string

    @Allow()
    @IsString()
    under: string
}

export class Reason {
    @Allow()
    @IsUrl()
    icon: string

    @Allow()
    @IsString()
    title: string

    @Allow()
    @IsString()
    content: string
}

export class WhyChooseUs {
    @Allow()
    @IsUrl()
    image: string

    @Allow()
    @IsArray()
    reasons: Reason[]
}

export class FrontSettingsValidator {
    @Allow()
    @IsIn(['vi', 'en'])
    language: string

    @Allow()
    businessName: string

    @Allow()
    title: string

    @Allow()
    description: string

    @Allow()
    keywords: string

    @Allow()
    phone: string

    @Allow()
    headerHotline: string

    @Allow()
    @IsEmail()
    headerEmail: string

    @Allow()
    footerTitle: string

    @Allow()
    footerAddress: string

    @Allow()
    footerPhone: string

    @Allow()
    @IsEmail()
    footerEmail: string

    @Allow()
    @IsUrl()
    footerWebsite: string

    @Allow()
    @IsUrl(urlCommonOptions('facebook.com'))
    facebook: string

    @Allow()
    @IsUrl(urlCommonOptions('facebook.com'))
    fanpageFB: string

    @Allow()
    copyRight: string

    @Allow()
    copyRightEn: string

    @Allow()
    @IsEmail()
    gmail: string

    @Allow()
    @IsUrl(urlCommonOptions('twitter.com'))
    twitter: string

    @Allow()
    @IsUrl(urlCommonOptions('youtube.com'))
    youtube: string

    @Allow()
    @IsUrl(urlCommonOptions('zalo.me'))
    zalo: string

    @Allow()
    @IsUrl(urlCommonOptions('messenger.com'))
    messenger: string

    @Allow()
    contact: string

    @Allow()
    @IsUrl(urlCommonOptions('google.com'))
    map: string

    @Allow()
    partner: Partner

    @Allow()
    title1: Title

    @Allow()
    title2: Title

    @Allow()
    title3: string

    @Allow()
    whyChooseUs: WhyChooseUs
}
