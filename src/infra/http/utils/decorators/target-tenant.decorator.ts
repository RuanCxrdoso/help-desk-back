import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common'
import { TokenPayload } from '../../auth/jwt.strategy'
import { ROLE } from '@/core/enums/role'

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user as TokenPayload
    const body = request.body

    if (user.role === ROLE.SUPER_ADMIN) {
      if (!body.tenantId) {
        throw new BadRequestException(
          'A tenant context is required to register an administrator.',
        )
      }

      return String(body.tenantId)
    }

    return user.tenantId
  },
)
