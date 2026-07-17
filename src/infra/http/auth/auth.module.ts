import { Module } from '@nestjs/common'
import { EnvModule } from '../../env/env.module'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './jwt.strategy'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './jwt-auth.guard'
import { CaslAbilityFactory } from './casl/casl-ability.factory'
import { PoliciesGuard } from './casl/policies.guard'

@Module({
  imports: [EnvModule, PassportModule],
  providers: [
    JwtStrategy,
    CaslAbilityFactory,
    PoliciesGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [CaslAbilityFactory, PoliciesGuard],
})
export class AuthModule {}
