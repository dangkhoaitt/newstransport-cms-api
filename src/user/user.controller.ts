import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    UsePipes,
    Req
} from '@nestjs/common'
import { Request } from 'express'
import { Roles } from 'src/decorator/roles.decorator'
import { MainValidationPipe } from 'src/share/pipes/main-validation.pipe'
import { Facet } from 'src/share/service/base.service'
import { IdValidator } from 'src/share/validator/base.validator'
import { ADMIN } from './user.constant'
import { UserService } from './user.service'
import { DeleteUserValidator, EditUserValidator, InsertUserValidator, UserQuery, UserValidator } from './user.validator'

/**
 * User Controller
 * @author KhoaVD
 */
@Controller('user')
export class UserController {
    @Inject() private userService: UserService

    @Post()
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async create(@Body() body: InsertUserValidator): Promise<object> {
        return await this.userService.create(body)
    }

    @Get()
    @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
    async getAll(@Query() query: UserQuery): Promise<Facet> {
        return this.userService.getAll(query)
    }

    @Get(':id')
    @UsePipes(new MainValidationPipe())
    async getDetail(@Param() { id }: IdValidator): Promise<object> {
        return this.userService.getDetail(id)
    }

    @Patch(':id')
    @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
    async edit(@Param() { id }: EditUserValidator, @Body() body: UserValidator, @Req() req: Request): Promise<object> {
        return this.userService.edit(id, body, req.user['role'])
    }

    @HttpCode(204)
    @Delete(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async delete(@Param() { id }: DeleteUserValidator): Promise<null> {
        return this.userService.delete(id)
    }
}
