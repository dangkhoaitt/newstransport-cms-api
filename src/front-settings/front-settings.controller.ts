import { Body, Controller, Get, Inject, Patch, UsePipes } from '@nestjs/common'
import { Roles } from 'src/decorator/roles.decorator'
import { MainValidationPipe } from 'src/share/pipes/main-validation.pipe'
import { ADMIN } from 'src/user/user.constant'
import { FrontSettings } from './front-settings.interface'
import { FrontSettingsService } from './front-settings.service'
import { FrontSettingsValidator } from './front-settings.validator'
import { Public } from 'src/decorator/public.decorator'

@Controller('front-settings')
export class FrontSettingsController {
    @Inject() private frontSettingsService: FrontSettingsService

    @Public()
    @Get()
    async getAll(): Promise<FrontSettings> {
        return this.frontSettingsService.getAll()
    }

    @Patch()
    @Roles(ADMIN)
    @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
    async update(@Body() body: FrontSettingsValidator): Promise<boolean> {
        return this.frontSettingsService.update(body)
    }
}
