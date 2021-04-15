import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, UsePipes } from '@nestjs/common'
import { Roles } from 'src/decorator/roles.decorator'
import { MainValidationPipe } from 'src/share/pipes/main-validation.pipe'
import { IdValidator } from 'src/share/validator/base.validator'
import { ADMIN } from 'src/user/user.constant'
import { ProvinceService } from './province.service'
import { InsertProvinceValidator, ProvinceValidator } from './province.validator'

/**
 * Province Controller
 * @author Khoa
 */
@Controller('province')
export class ProvinceController {
    @Inject() private provinceService: ProvinceService

    @Get()
    @UsePipes(new MainValidationPipe())
    async getAll(): Promise<object[]> {
        return this.provinceService.getAll()
    }

    @Get(':id')
    async getDetail(@Param() { id }: IdValidator): Promise<object> {
        return this.provinceService.getDetail(id)
    }

    @Post()
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async create(@Body() body: InsertProvinceValidator): Promise<object> {
        return this.provinceService.insert(body)
    }

    @Patch(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
    async edit(@Param() { id }: IdValidator, @Body() body: ProvinceValidator): Promise<object> {
        return this.provinceService.edit(id, body)
    }

    @HttpCode(204)
    @Delete(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async delete(@Param() param: IdValidator): Promise<boolean> {
        return this.provinceService.delete(param.id)
    }
}
