import { Module } from '@nestjs/common'
import { HttpModule } from './http/http.module'
import { EnvModule } from './env/env.module'
import { AuthModule } from './http/auth/auth.module'

@Module({
  imports: [AuthModule, HttpModule, EnvModule],
})
export class AppModule {}
