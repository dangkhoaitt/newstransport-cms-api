import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, UsePipes } from '@nestjs/common'
import { Roles } from 'src/decorator/roles.decorator'
import { MainValidationPipe } from 'src/share/pipes/main-validation.pipe'
import { IdValidator } from 'src/share/validator/base.validator'
import { ADMIN } from 'src/user/user.constant'
import { ProgressService } from './progress.service'
import { ProgressValidator } from './progress.validator'

/**
 * Progress Controller
 * @author KhoaVD
 */
@Controller('progress')
export class ProgressController {
    @Inject() private progressService: ProgressService

    @Get()
    @UsePipes(new MainValidationPipe())
    async getAll(): Promise<object[]> {
        return this.progressService.getAll()
    }

    @Get(':id')
    async getDetail(@Param() { id }: IdValidator): Promise<object> {
        return this.progressService.getDetail(id)
    }

    @Post()
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async create(@Body() body: ProgressValidator): Promise<object> {
        return this.progressService.insert(body)
    }

    @Patch(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
    async edit(@Param() { id }: IdValidator, @Body() body: ProgressValidator): Promise<object> {
        return this.progressService.edit(id, body)
    }

    @HttpCode(204)
    @Delete(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async delete(@Param() { id }: IdValidator): Promise<boolean> {
        return this.progressService.delete(id)
    }
}
