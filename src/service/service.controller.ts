import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, UsePipes, HttpCode } from '@nestjs/common'
import { Roles } from 'src/decorator/roles.decorator'
import { MainValidationPipe } from 'src/share/pipes/main-validation.pipe'
import { ADMIN } from 'src/user/user.constant'
import { ServiceService } from './service.service'
import { ServiceSearch, ServiceBody } from './service.validator'
import { IdValidator } from 'src/share/validator/base.validator'

/**
 * Service Controller
 * @author KhoaVD
 */
@Controller('service')
export class ServiceController {
    @Inject() private serviceService: ServiceService

    @Get()
    @UsePipes(new MainValidationPipe())
    async getAll(@Query() input: ServiceSearch): Promise<object[]> {
        return this.serviceService.getAll({ ...input })
    }

    @Get(':id')
    async getDetail(@Param() { id }: IdValidator): Promise<object> {
        return this.serviceService.getDetail(id)
    }

    @Post()
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async create(@Body() body: ServiceBody): Promise<object> {
        return this.serviceService.insert(body)
    }

    @Patch(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
    async edit(@Param() { id }: IdValidator, @Body() body: ServiceBody): Promise<object> {
        return this.serviceService.edit(id, body)
    }

    @HttpCode(204)
    @Delete(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async delete(@Param() { id }: IdValidator): Promise<boolean> {
        return this.serviceService.delete(id)
    }
}
