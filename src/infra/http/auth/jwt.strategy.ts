import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { EnvService } from '@/infra/env/env.service'
import z from 'zod'
import { ROLE } from '@/core/enums/role'
import { ISuperAdminsRepository } from '@/domain/help-desk/application/repositories/super-admins-repository'
import { IUsersRepository } from '@/domain/help-desk/application/repositories/users-repository'
import { SuperAdmin } from '@/domain/help-desk/enterprise/entities/super-admin'
import { AuthUser } from '@/domain/help-desk/enterprise/entities/auth-user'

export const userTokenPayloadSchema = z.object({
  sub: z.uuid(),
  tenantId: z.uuid(),
  role: z.enum([ROLE.EMPLOYEE, ROLE.TECHNICIAN, ROLE.ADMIN]),
})

export const superAdminTokenPayloadSchema = z.object({
  sub: z.uuid(),
  tenantId: z.uuid().optional(),
  role: z.literal(ROLE.SUPER_ADMIN),
})

export const tokenPayloadSchema = z.union([
  userTokenPayloadSchema,
  superAdminTokenPayloadSchema,
])

export type TokenPayload = z.infer<typeof tokenPayloadSchema>

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private env: EnvService,
    private superAdminsRepository: ISuperAdminsRepository,
    private usersRepository: IUsersRepository,
  ) {
    const publicKey = env.get('JWT_PUBLIC_KEY')

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    })
  }

  async validate(payload: TokenPayload) {
    let userExists: SuperAdmin | AuthUser | null

    if (payload.role === 'SUPER_ADMIN') {
      userExists = await this.superAdminsRepository.findById(payload.sub)
    } else {
      userExists = await this.usersRepository.findById(payload.sub)
    }

    if (!userExists) {
      throw new UnauthorizedException('Usuário inválido ou inativo.')
    }

    return tokenPayloadSchema.parse(payload)
  }
}
