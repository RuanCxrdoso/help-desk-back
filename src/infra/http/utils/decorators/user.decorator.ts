import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { TokenPayload } from '../../auth/jwt.strategy'

export const User = createParamDecorator(
  (_, ctx: ExecutionContext): TokenPayload => {
    const request = ctx.switchToHttp().getRequest()

    return request.user
  },
)
