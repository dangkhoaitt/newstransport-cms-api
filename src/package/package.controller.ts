import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, UsePipes } from '@nestjs/common'
import { Roles } from 'src/decorator/roles.decorator'
import { MainValidationPipe } from 'src/share/pipes/main-validation.pipe'
import { IdValidator } from 'src/share/validator/base.validator'
import { ADMIN } from 'src/user/user.constant'
import { PackageService } from './package.service'
import { PackageValidator } from './package.validator'

/**
 * Package Controller
 * @author Khoa
 */
@Controller('package')
export class PackageController {
    @Inject() private packageService: PackageService

    @Get()
    @UsePipes(new MainValidationPipe())
    async getAll(): Promise<object[]> {
        return this.packageService.getAll()
    }

    @Get(':id')
    async getDetail(@Param() { id }: IdValidator): Promise<object> {
        return this.packageService.getDetail(id)
    }

    @Post()
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async create(@Body() body: PackageValidator): Promise<object> {
        return this.packageService.insert(body)
    }

    @Patch(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
    async edit(@Param() { id }: IdValidator, @Body() body: PackageValidator): Promise<object> {
        return this.packageService.edit(id, body)
    }

    @HttpCode(204)
    @Delete(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async delete(@Param() { id }: IdValidator): Promise<boolean> {
        return this.packageService.delete(id)
    }
}
