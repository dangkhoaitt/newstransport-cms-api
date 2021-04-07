import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, Query, UsePipes } from '@nestjs/common'
import { Roles } from 'src/decorator/roles.decorator'
import { MainValidationPipe } from 'src/share/pipes/main-validation.pipe'
import { IdValidator } from 'src/share/validator/base.validator'
import { ADMIN, MANAGER } from 'src/user/user.constant'
import { CustomerService } from './customer.service'
import { CustomerValidator, EditCustomerValidator } from './customer.validator'

/**
 * Customer Controller
 * @author Thuan
 */
@Controller('customer')
export class CustomerController {
    @Inject() private customerService: CustomerService

    @Get()
    @UsePipes(new MainValidationPipe())
    async getAll(): Promise<object[]> {
        return this.customerService.getAll()
    }

    @Get(':param')
    async getDetail(@Param() { param }, @Query() { isCode }): Promise<object> {
        return this.customerService.getDetail(param, isCode)
    }

    @Post()
    @UsePipes(new MainValidationPipe())
    async create(@Body() body: CustomerValidator): Promise<object> {
        return this.customerService.insert(body)
    }

    @Patch(':id')
    @Roles(ADMIN, MANAGER)
    @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
    async edit(@Param() { id }: IdValidator, @Body() body: EditCustomerValidator): Promise<object> {
        return this.customerService.edit(id, body)
    }

    @HttpCode(204)
    @Delete(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async delete(@Param() { id }: IdValidator): Promise<boolean> {
        return this.customerService.delete(id)
    }
}
