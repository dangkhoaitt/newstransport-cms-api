import { Body, Controller, Get, Inject, Param, Post, Query, UsePipes } from '@nestjs/common'
import { Public } from 'src/decorator/public.decorator'
import { PostQuery, QueryValidator } from 'src/post/post.validator'
import { QuoteValidator } from 'src/quote/quote.validator'
import { MainValidationPipe } from 'src/share/pipes/main-validation.pipe'
import { Facet } from 'src/share/service/base.service'
import { FrontService } from './front.service'

/**
 * Front Controller
 * @author KhoaVD
 */

@Controller('front')
export class FrontController {
    @Inject() private frontService: FrontService

    @Public()
    @Get('sitemap')
    async getSitemap(): Promise<object[]> {
        return this.frontService.getSitemap()
    }

    @Public()
    @Get('banner')
    @UsePipes(new MainValidationPipe())
    async getAllBanner(): Promise<object[]> {
        return this.frontService.getAllBanner()
    }

    @Public()
    @Get('category')
    @UsePipes(new MainValidationPipe())
    async getAllCategory(): Promise<object[]> {
        return this.frontService.getAllCategory()
    }

    @Public()
    @Get('category/:param')
    @UsePipes(new MainValidationPipe())
    async getDetailCategory(@Param() { param }): Promise<object> {
        return this.frontService.getDetailCategory(param)
    }

    @Public()
    @Get('post')
    @UsePipes(new MainValidationPipe())
    async getAll(@Query() query: PostQuery): Promise<Facet> {
        return this.frontService.getAllPost(query)
    }

    @Public()
    @Get('post/:param')
    @UsePipes(new MainValidationPipe())
    async getDetail(@Param() { param }, @Query() { language }: QueryValidator): Promise<object> {
        return this.frontService.getDetailPost(param, language)
    }

    @Public()
    @Get('bill/:param')
    async getDetailBill(@Param() { param }): Promise<object> {
        return this.frontService.getDetailBill(param)
    }

    @Public()
    @Post('quote')
    @UsePipes(new MainValidationPipe())
    async create(@Body() body: QuoteValidator): Promise<object> {
        return this.frontService.insertQuote(body)
    }
}
