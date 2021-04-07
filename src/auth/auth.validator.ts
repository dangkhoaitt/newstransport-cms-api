import { IsBoolean, IsJWT, IsNotEmpty, IsOptional } from 'class-validator'

export class AuthRequest {
    @IsNotEmpty()
    username: string

    @IsNotEmpty()
    password: string

    @IsOptional()
    @IsBoolean()
    remember?: boolean
}

export class RefreshTokenRequest {
    @IsJWT()
    refreshToken: string
}

export class ChangePasswordValidator {
    @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu mới' })
    password: string
}
