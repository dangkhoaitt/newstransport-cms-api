import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import * as bodyParser from 'body-parser'
import { useContainer } from 'class-validator'
import { AppModule } from './app.module'
import { TransformResponseInterceptor } from './share/interceptors/transform-response.interceptor'
import components from './swagger/base.components'
import paths from './swagger/base.paths'
import DocumentBuilder from './swagger/DocumentBuilder'

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, { logger: true })
    app.setGlobalPrefix('/api')
    //set limit size of the JSON request
    app.use(bodyParser.json({ limit: '50mb' }))
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
    app.enableCors({
        allowedHeaders: '*',
        exposedHeaders: '*',
        origin: '*'
    })
    app.useGlobalInterceptors(new TransformResponseInterceptor())

    useContainer(app.select(AppModule), { fallbackOnErrors: true })

    // setup Swagger
    const document = SwaggerModule.createDocument(app, DocumentBuilder)
    document.paths = paths
    document.components = components
    SwaggerModule.setup('swagger', app, document)

    const port = process.env.PORT || 3000
    await app.listen(port)
    Logger.log('Application is running at port: http://localhost:' + port)
}
bootstrap()
