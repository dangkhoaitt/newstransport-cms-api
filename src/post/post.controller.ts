import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, Query, UsePipes } from '@nestjs/common'
import { Roles } from 'src/decorator/roles.decorator'
import { MainValidationPipe } from 'src/share/pipes/main-validation.pipe'
import { ParseMongoIdPipe } from 'src/share/pipes/pipe-transform'
import { Facet } from 'src/share/service/base.service'
import { IdValidator } from 'src/share/validator/base.validator'
import { ADMIN } from 'src/user/user.constant'
import { PostService } from './post.service'
import { GetPostDetailValidator, PostQuery, PostValidator, QueryValidator } from './post.validator'

/**
 * Post Controller
 * @author KhoaVD
 */

@Controller('post')
export class PostController {
    @Inject() private postService: PostService

    @Get()
    @UsePipes(new MainValidationPipe())
    async getAll(@Query() query: PostQuery): Promise<Facet> {
        return this.postService.getAll(query)
    }

    @Get(':id')
    @UsePipes(new MainValidationPipe())
    async getDetail(@Param() { id }: IdValidator, @Query() { language }: QueryValidator): Promise<object> {
        return this.postService.getDetail(id, language)
    }

    @Post()
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async create(@Body() body: PostValidator): Promise<object> {
        return this.postService.create(body)
    }

    @Patch(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
    async edit(
        @Body() body: PostValidator,
        @Param() { id }: GetPostDetailValidator,
        @Query() { language }: QueryValidator
    ): Promise<object> {
        return this.postService.edit(id, body, language)
    }

    @HttpCode(204)
    @Delete(':id')
    @Roles(ADMIN)
    async delete(@Param('id', new ParseMongoIdPipe()) id): Promise<null> {
        return this.postService.delete(id)
    }
}
