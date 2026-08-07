import { FetchAdminsUseCase } from '@/domain/help-desk/application/use-cases/fetch-admins'
import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { PoliciesGuard } from '../../auth/casl/policies.guard'
import { CheckPolicies } from '../../auth/casl/check-policies.decorator'
import { Action } from '../../auth/casl/action'
import { ZodValidationPipe } from '../../utils/pipes/zod-validation.pipe'
import { User } from '../../utils/decorators/user.decorator'
import { type TokenPayload } from '../../auth/jwt.strategy'
import {
  type PaginationQueryParamDTO,
  paginationQueryParamSchema,
} from '@/core/types/pagination'
import { ROLE } from '@/core/enums/role'
import { HttpUserPresenter } from '@/infra/presenters/http-user.presenter'

const paginationQueryParamPipe = new ZodValidationPipe(
  paginationQueryParamSchema,
)

@Controller('/admins')
export class FetchAdminsController {
  constructor(private readonly fetchAdminsUseCase: FetchAdminsUseCase) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Read, 'User'))
  async handle(
    @Query(paginationQueryParamPipe)
    { tenantId: paramTenantId, ...params }: PaginationQueryParamDTO,
    @User() user: TokenPayload,
  ) {
    let tenantId: string

    const { role } = user

    if (role === ROLE.SUPER_ADMIN) {
      if (!paramTenantId) {
        throw new BadRequestException('Missing tenantId parameter')
      }
      tenantId = paramTenantId
    } else {
      if (!user.tenantId) {
        throw new UnauthorizedException('Invalid token')
      }
      tenantId = user.tenantId
    }

    const result = await this.fetchAdminsUseCase.execute({
      tenantId,
      callerRole: role,
      params,
    })

    if (result.isLeft()) {
      throw result.value
    }

    const { admins, meta } = result.value

    return {
      items: admins.map(HttpUserPresenter.toHttp),
      meta,
    }
  }
}
