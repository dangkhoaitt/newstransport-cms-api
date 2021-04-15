import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator'

/**
 * Quote Validator
 * @author Khoa
 */

export class QuoteValidator {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name: string

    @IsNotEmpty()
    @IsString()
    @MaxLength(20)
    tel: string

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @Matches(/^(\s*[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,6}\s*)*$/)
    email: string

    @IsNotEmpty()
    @IsString()
    content: string
}
