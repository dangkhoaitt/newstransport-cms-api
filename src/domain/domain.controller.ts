import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    Patch,
    Post,
    UsePipes
} from '@nestjs/common'
import { Roles } from 'src/decorator/roles.decorator'
import { MainValidationPipe } from 'src/share/pipes/main-validation.pipe'
import { IdValidator } from 'src/share/validator/base.validator'
import { ADMIN } from 'src/user/user.constant'
import { Domain } from './domain.interface'
import { DomainService } from './domain.service'
import { DeleteDomainValidator, DomainValidator } from './domain.validator'

@Controller('domain')
export class DomainController {
    @Inject() private domainService: DomainService

    @Get()
    @UsePipes(new MainValidationPipe())
    async getAll(): Promise<Domain[]> {
        return this.domainService.getAll()
    }

    @Post()
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async create(@Body() body: DomainValidator): Promise<Domain> {
        return this.domainService.insert(body)
    }

    @Patch(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
    async edit(@Param() { id }: IdValidator, @Body() body: DomainValidator): Promise<object> {
        return this.domainService.edit(id, body)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe())
    async delete(@Param() { id }: DeleteDomainValidator): Promise<boolean> {
        return this.domainService.delete(id)
    }
}
