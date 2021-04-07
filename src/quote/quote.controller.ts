import { Controller, Delete, Get, HttpCode, Inject, Param, Patch, UsePipes } from '@nestjs/common'
import { Roles } from 'src/decorator/roles.decorator'
import { MainValidationPipe } from 'src/share/pipes/main-validation.pipe'
import { ParseMongoIdPipe } from 'src/share/pipes/pipe-transform'
import { IdValidator } from 'src/share/validator/base.validator'
import { ADMIN } from 'src/user/user.constant'
import { QuoteService } from './quote.service'

/**
 * Quote Controller
 * @author Thuan
 */
@Controller('quote')
export class QuoteController {
    @Inject() private quoteService: QuoteService

    @Get()
    @UsePipes(new MainValidationPipe())
    async getAll(): Promise<object[]> {
        return this.quoteService.getAll()
    }

    @Get(':id')
    async getDetail(@Param('id', new ParseMongoIdPipe()) id): Promise<object> {
        return this.quoteService.getDetail(id)
    }

    @Patch(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async send(@Param() { id }: IdValidator): Promise<object> {
        return this.quoteService.send(id)
    }

    @HttpCode(204)
    @Delete(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async delete(@Param() { id }: IdValidator): Promise<boolean> {
        return this.quoteService.delete(id)
    }
}
