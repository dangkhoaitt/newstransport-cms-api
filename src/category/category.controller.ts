import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, Query, UsePipes } from '@nestjs/common'
import { Roles } from 'src/decorator/roles.decorator'
import { MainValidationPipe } from 'src/share/pipes/main-validation.pipe'
import { ParseMongoIdPipe } from 'src/share/pipes/pipe-transform'
import { IdValidator } from 'src/share/validator/base.validator'
import { ADMIN } from 'src/user/user.constant'
import { CategoryService } from './category.service'
import {
    CategoryQuery,
    CategoryValidator,
    DeleteCategoryValidator,
    InsertCategoryValidator
} from './category.validator'

/**
 * Category Controller
 * @author KhoaVD
 */
@Controller('category')
export class CategoryController {
    @Inject() private categoryService: CategoryService

    @Post()
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async create(@Body() body: InsertCategoryValidator): Promise<object> {
        return this.categoryService.create(body)
    }

    @Get()
    @UsePipes(new MainValidationPipe())
    async getAll(@Query() query: CategoryQuery): Promise<object[]> {
        return this.categoryService.getAll(query)
    }

    @Get('dropdown')
    @UsePipes(new MainValidationPipe())
    async dropdown(@Query() query: CategoryQuery): Promise<object[]> {
        return this.categoryService.dropdown(query)
    }

    @Get(':id')
    async getDetail(@Param('id', new ParseMongoIdPipe()) id): Promise<object> {
        return this.categoryService.getDetail(id)
    }

    @Patch(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
    async edit(@Param() { id }: IdValidator, @Body() body: CategoryValidator): Promise<object> {
        return this.categoryService.edit(id, body)
    }

    @HttpCode(204)
    @Delete(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async delete(@Param() { id }: DeleteCategoryValidator): Promise<null> {
        return this.categoryService.delete(id)
    }
}
