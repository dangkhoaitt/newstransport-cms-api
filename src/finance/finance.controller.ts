import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, UsePipes, HttpCode } from '@nestjs/common'
import { Roles } from 'src/decorator/roles.decorator'
import { MainValidationPipe } from 'src/share/pipes/main-validation.pipe'
import { ADMIN } from 'src/user/user.constant'
import { FinanceService } from './finance.service'
import { IdValidator } from 'src/share/validator/base.validator'
import { FinanceValidator } from './finance.validator'

/**
 * Finance Controller
 * @author Khoa
 */
@Controller('finance')
export class FinanceController {
    @Inject() private financeService: FinanceService

    @Get()
    @UsePipes(new MainValidationPipe())
    async getAll(): Promise<object[]> {
        return this.financeService.getAll()
    }

    @Get(':id')
    async getDetail(@Param() { id }: IdValidator): Promise<object> {
        return this.financeService.getDetail(id)
    }

    @Post()
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async create(@Body() body: FinanceValidator): Promise<object> {
        return this.financeService.insert(body)
    }

    @Patch(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
    async edit(@Param() { id }: IdValidator, @Body() body: FinanceValidator): Promise<object> {
        return this.financeService.edit(id, body)
    }

    @HttpCode(204)
    @Delete(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async delete(@Param() { id }: IdValidator): Promise<boolean> {
        return this.financeService.delete(id)
    }
}
