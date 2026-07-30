import { NestFactory } from '@nestjs/core'
import { AppModule } from './infra/app.module.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')

  await app.listen(process.env.PORT ?? 3000)
}
void bootstrap()
