import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, UsePipes } from '@nestjs/common'
import { Roles } from 'src/decorator/roles.decorator'
import { MainValidationPipe } from 'src/share/pipes/main-validation.pipe'
import { IdValidator } from 'src/share/validator/base.validator'
import { ADMIN } from 'src/user/user.constant'
import { TruckService } from './truck.service'
import { TruckValidator } from './truck.validator'

/**
 * Truck Controller
 * @author Thuan
 */
@Controller('truck')
export class TruckController {
    @Inject() private truckService: TruckService

    @Get()
    @UsePipes(new MainValidationPipe())
    async getAll(): Promise<object[]> {
        return this.truckService.getAll()
    }

    @Get(':id')
    async getDetail(@Param() { id }: IdValidator): Promise<object> {
        return this.truckService.getDetail(id)
    }

    @Post()
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async create(@Body() body: TruckValidator): Promise<object> {
        return this.truckService.insert(body)
    }

    @Patch(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
    async edit(@Param() { id }: IdValidator, @Body() body: TruckValidator): Promise<object> {
        return this.truckService.edit(id, body)
    }

    @HttpCode(204)
    @Delete(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async delete(@Param() { id }: IdValidator): Promise<boolean> {
        return this.truckService.delete(id)
    }
}
