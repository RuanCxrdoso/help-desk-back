import { FetchTechniciansUseCase } from '@/domain/help-desk/application/use-cases/fetch-technicians'
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CheckPolicies } from '../../auth/casl/check-policies.decorator'
import { Action } from '../../auth/casl/action'
import { PoliciesGuard } from '../../auth/casl/policies.guard'
import { ZodValidationPipe } from '../../utils/pipes/zod-validation.pipe'
import {
  type PaginationQueryParamDTO,
  paginationQueryParamSchema,
} from '@/core/types/pagination'
import { User } from '../../utils/decorators/user.decorator'
import { type TokenPayload } from '../../auth/jwt.strategy'
import { HttpUserPresenter } from '@/infra/presenters/http-user.presenter'
import { TargetTenant } from '../../utils/decorators/target-tenant.decorator'

const fetchTechniciansParamsPipe = new ZodValidationPipe(
  paginationQueryParamSchema,
)

@Controller('/technicians')
export class FetchTechniciansController {
  constructor(
    private readonly fetchTechniciansUseCase: FetchTechniciansUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Read, 'User'))
  async handle(
    @Query(fetchTechniciansParamsPipe) params: PaginationQueryParamDTO,
    @TargetTenant() tenantId: string,
    @User() user: TokenPayload,
  ) {
    const result = await this.fetchTechniciansUseCase.execute({
      tenantId,
      callerRole: user.role,
      params,
    })

    if (result.isLeft()) {
      throw result.value
    }

    const { technicians, meta } = result.value

    return {
      items: technicians.map(HttpUserPresenter.toHttp),
      meta,
    }
  }
}
