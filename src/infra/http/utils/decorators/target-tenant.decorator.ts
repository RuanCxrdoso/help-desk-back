import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common'
import { ROLE } from '@/core/enums/role'

export const TargetTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user

    if (user.role !== ROLE.SUPER_ADMIN) {
      return user.tenantId
    }

    const requestedTenantId = request.headers['x-tenant-id']

    if (!requestedTenantId) {
      throw new BadRequestException(
        'SuperAdmins devem informar o cabeçalho X-Tenant-ID para esta operação',
      )
    }

    return requestedTenantId
  },
)
