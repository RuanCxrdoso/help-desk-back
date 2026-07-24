import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { EnvService } from '@/infra/env/env.service'
import z from 'zod'
import { ROLE } from '@/core/enums/role'

export const userTokenPayloadSchema = z.object({
  sub: z.uuid(),
  tenantId: z.uuid(),
  role: z.enum([ROLE.EMPLOYEE, ROLE.TECHNICIAN, ROLE.ADMIN]),
})

export const superAdminTokenPayloadSchema = z.object({
  sub: z.uuid(),
  role: z.literal(ROLE.SUPER_ADMIN),
})

export const tokenPayloadSchema = z.union([
  userTokenPayloadSchema,
  superAdminTokenPayloadSchema,
])

export type TokenPayload = z.infer<typeof tokenPayloadSchema>

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(env: EnvService) {
    const publicKey = env.get('JWT_PUBLIC_KEY')

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    })
  }

  async validate(payload: TokenPayload) {
    return tokenPayloadSchema.parse(payload)
  }
}
