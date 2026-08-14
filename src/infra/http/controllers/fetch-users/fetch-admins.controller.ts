import { FetchAdminsUseCase } from '@/domain/help-desk/application/use-cases/fetch-admins'
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
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
import { HttpUserPresenter } from '@/infra/presenters/http-user.presenter'
import { TargetTenant } from '../../utils/decorators/target-tenant.decorator'

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
    @Query(paginationQueryParamPipe) params: PaginationQueryParamDTO,
    @TargetTenant() tenantId: string,
    @User() user: TokenPayload,
  ) {
    const result = await this.fetchAdminsUseCase.execute({
      tenantId,
      callerRole: user.role,
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
