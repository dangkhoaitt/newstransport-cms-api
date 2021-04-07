import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from '@nestjs/common'
import { Roles } from 'src/decorator/roles.decorator'
import { LANG_VI } from 'src/share/constants/collection.constant'
import { MainValidationPipe } from 'src/share/pipes/main-validation.pipe'
import { ParseMongoIdPipe } from 'src/share/pipes/pipe-transform'
import { ADMIN } from 'src/user/user.constant'
import { Banner } from './banner.interface'
import { BannerService } from './banner.service'
import { BannerValidator, SortBannerValidator } from './banner.validator'

/**
 * Banner Controller
 * @author KhoaVD
 */

@Controller('banner')
export class BannerController {
    constructor(private bannerService: BannerService) {}

    @Post()
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async create(@Body() body: BannerValidator): Promise<object> {
        const { isShow = true, language = LANG_VI } = body
        return this.bannerService.create({ ...body, isShow, language })
    }

    @Get()
    async getAll(): Promise<Banner[]> {
        return this.bannerService.getAll()
    }

    @Get(':id')
    async getDetail(@Param('id', new ParseMongoIdPipe()) id): Promise<object> {
        return this.bannerService.getDetail(id)
    }

    @Patch('sort')
    @UsePipes(new MainValidationPipe())
    async sort(@Body() { ids }: SortBannerValidator): Promise<boolean> {
        return this.bannerService.sort(ids)
    }

    @Patch(':id')
    @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
    async edit(@Param('id', new ParseMongoIdPipe()) id, @Body() body: BannerValidator): Promise<boolean> {
        return this.bannerService.edit(id, body)
    }

    @Delete(':id')
    async delete(@Param('id', new ParseMongoIdPipe()) id): Promise<void> {
        return this.bannerService.delete(id)
    }
}
