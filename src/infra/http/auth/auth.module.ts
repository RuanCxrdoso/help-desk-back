import { Module } from '@nestjs/common'
import { EnvModule } from '../../env/env.module'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './jwt.strategy'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './jwt-auth.guard'
import { CaslAbilityFactory } from './casl/casl-ability.factory'
import { PoliciesGuard } from './casl/policies.guard'
import { DatabaseModule } from '@/infra/database/database.module'
import { IAuthorizationService } from '@/domain/help-desk/application/auth/authorization.service'
import { CaslAuthorizationService } from './casl/casl-authorization.service'

@Module({
  imports: [EnvModule, PassportModule, DatabaseModule],
  providers: [
    JwtStrategy,
    CaslAbilityFactory,
    PoliciesGuard,
    {
      provide: IAuthorizationService,
      useClass: CaslAuthorizationService,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [CaslAbilityFactory, PoliciesGuard, IAuthorizationService],
})
export class AuthModule {}
