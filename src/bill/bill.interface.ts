import { BaseInterface } from 'src/share/interfaces/base.interface'

/**
 * Bill Interface
 * @author KhoaVD
 */
export interface Bill extends BaseInterface {
    code: string
    senderInfo: UserInfo
    receiverInfo: UserInfo
    mainService: { code: string; price: number }
    extraService: { code: string; price: number }[]
    goodsInfo: GoodsInfo[]
    discount: number
    discountUnit: number
    total: number
    finance: string
    progress: string
    truck: string
    weight: number
    weightUnit: number
    inventory: number
}

interface UserInfo {
    id?: string
    code?: string
    name: string
    tel: string
    provinceCode: number
    districtCode: number
    address: string
}

interface GoodsInfo {
    quantity: number
    package: string
    content: string
}

interface UserInfoExport extends UserInfo {
    provinceName: string
    districtName: string
}

export type BillExport = {
    code: string
    progress: string
    finance: string
    senderInfo: UserInfoExport
    provinceTo: string
    districtTo: string
    senderCode: string
    senderName: string
    senderTel: string
    senderAdr: string
    receiverInfo: UserInfoExport
    provinceFrom: string
    districtFrom: string
    receiverName: string
    receiverTel: string
    receiverAdr: string
    deliverMember: string
    inventory: number
    inventoryExport: string
    mainService: string
    extraService: { code: string; name: string; price: number }[]
    weight: number
    weightExport: string
    weightUnit: number
    truck: string
    discount: number
    discountExport: string
    discountUnit: number
    total: number
    totalExport: string
    goodsInfo: GoodsInfo[]
    goodsInfoExport: string
    insertBy: string
    insertTime: number
    insertTimeExport: string
}
