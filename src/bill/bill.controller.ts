import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    Res,
    UsePipes
} from '@nestjs/common'
import { Response } from 'express'
import { Roles } from 'src/decorator/roles.decorator'
import { MainValidationPipe } from 'src/share/pipes/main-validation.pipe'
import { Facet } from 'src/share/service/base.service'
import { IdValidator } from 'src/share/validator/base.validator'
import { ADMIN, MANAGER } from 'src/user/user.constant'
import { BillService } from './bill.service'
import { BillImportValidator, BillSearch, BillValidator } from './bill.validator'

/**
 * Bill Controller
 * @author KhoaVD
 */
@Controller('bill')
export class BillController {
    @Inject() private billService: BillService

    @Post('/import')
    @UsePipes(new MainValidationPipe({ includeValue: true }))
    async import(@Body() body: BillImportValidator): Promise<boolean> {
        return this.billService.import(body)
    }

    @Get('/export')
    @UsePipes(new MainValidationPipe())
    async export(@Query() query: BillSearch, @Res() res: Response): Promise<void> {
        const buffer = await this.billService.export(query)
        if (!buffer) throw new HttpException('export error', HttpStatus.BAD_REQUEST)
        const { customerCode, code, service, sendUnit, progress, finance, insertTimeTo, insertTimeFrom } = query
        let filename = `VanDon_${this.billService.getDate()}`
        if (query) {
            if (code) filename = `VanDon_${code}_${this.billService.getDate()}`
            else if (customerCode) filename = `VanDon_KH_${customerCode}_${this.billService.getDate()}`
            else if (sendUnit) filename = `VanDon_SendUnit_${sendUnit}_${this.billService.getDate()}`
            else if (service) filename = `VanDon_DV_${service}_${this.billService.getDate()}`
            else if (progress) filename = `VanDon_TT_${progress}_${this.billService.getDate()}`
            else if (finance) filename = `VanDon_TTKT_${finance}_${this.billService.getDate()}`
            else if (insertTimeFrom && !insertTimeTo) {
                filename = `VanDon_TimeFrom${this.billService.getDate(insertTimeFrom)}_${this.billService.getDate()}`
            } else if (insertTimeTo && !insertTimeFrom) {
                filename = `VanDon_TimeTo${this.billService.getDate(insertTimeTo)}_${this.billService.getDate()}`
            } else if (insertTimeFrom && insertTimeTo) {
                filename = `VanDon_TimeFrom${this.billService.getDate(insertTimeFrom)}_TimeTo${this.billService.getDate(
                    insertTimeTo
                )}_${this.billService.getDate()}`
            }
        }
        res.set({
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Length': buffer.byteLength,
            'Content-Disposition': `attachment; filename=${filename}.xlsx`
        })
        res.send(buffer)
    }

    @Get()
    @UsePipes(new MainValidationPipe())
    async getAll(@Query() query: BillSearch): Promise<Facet> {
        return this.billService.getAll(query)
    }

    @Get(':id')
    @UsePipes(new MainValidationPipe())
    async getDetail(@Param() { id }: IdValidator): Promise<object> {
        return this.billService.getDetail(id)
    }

    @Post()
    @UsePipes(new MainValidationPipe())
    async create(@Body() body: BillValidator): Promise<object> {
        return this.billService.insert(body)
    }

    @Patch(':id')
    @Roles(ADMIN, MANAGER)
    @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
    async edit(@Param() { id }: IdValidator, @Body() body: BillValidator): Promise<object> {
        return this.billService.edit(id, body)
    }

    @HttpCode(204)
    @Delete(':id')
    @Roles(ADMIN, MANAGER)
    @UsePipes(new MainValidationPipe())
    async delete(@Param() { id }: IdValidator): Promise<boolean> {
        return this.billService.delete(id)
    }
}
