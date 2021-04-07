import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Patch,
    Post,
    Req,
    UnauthorizedException,
    UsePipes
} from '@nestjs/common'
import { Request } from 'express'
import { Roles } from 'src/decorator/roles.decorator'
import { isObjectEmpty } from 'src/share/common'
import { MainValidationPipe } from 'src/share/pipes/main-validation.pipe'
import { getExtraTime } from 'src/share/utils/date.util'
import { ADMIN, MEMBER, MANAGER } from 'src/user/user.constant'
import { Public } from '../decorator/public.decorator'
import { AuthService } from './auth.service'
import { AuthRequest, ChangePasswordValidator, RefreshTokenRequest } from './auth.validator'
import { AuthUser } from './interfaces/auth-user.interface'

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post()
    @UsePipes(new MainValidationPipe())
    async login(@Req() req: Request, @Body() body: AuthRequest): Promise<object> {
        const { username, password, remember } = body
        const token = await this.authService.login({ username, password, remember: !!remember }, req)
        if (isObjectEmpty(token)) {
            throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng')
        }
        return token
    }
    @Public()
    @Post('login')
    @UsePipes(new MainValidationPipe())
    async loginCMS(@Req() req: Request, @Body() body: AuthRequest): Promise<object> {
        const { username, password, remember } = body
        const token = await this.authService.login({ username, password, remember: !!remember }, req, true)
        if (isObjectEmpty(token)) {
            throw new UnauthorizedException('Không đăng nhập được.')
        }
        return token
    }

    @Public()
    @Post('refresh-token')
    @Roles(ADMIN, MANAGER, MEMBER)
    @UsePipes(new MainValidationPipe())
    async refreshToken(@Req() req: Request, @Body() body: RefreshTokenRequest): Promise<object> {
        const { refreshToken } = body
        const accessToken = this.authService.refreshToken(refreshToken, req)
        if (!accessToken) throw new ForbiddenException('Refresh token is not valid')
        return { accessToken, expiresIn: getExtraTime(process.env.JWT_EXPIRES_IN) }
    }

    @Get('/role')
    @Roles(ADMIN, MANAGER, MEMBER)
    async getByRole(@Req() request: Request): Promise<object> {
        const user = request.user as AuthUser
        return await this.authService.getRole(user.userId)
    }

    @Patch('change-password')
    @Roles(ADMIN, MANAGER, MEMBER)
    @UsePipes(new MainValidationPipe())
    async changePassword(@Req() req: Request, @Body() { password }: ChangePasswordValidator): Promise<boolean> {
        return this.authService.changePassword(req.user['userId'], password)
    }
}
