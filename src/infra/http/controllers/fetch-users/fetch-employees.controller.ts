import { FetchEmployeesUseCase } from '@/domain/help-desk/application/use-cases/fetch-employees'
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

const fetchEmployeesParamsPipe = new ZodValidationPipe(
  paginationQueryParamSchema,
)

@Controller('/employees')
export class FetchEmployeesController {
  constructor(private readonly fetchEmployeesUseCase: FetchEmployeesUseCase) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Read, 'User'))
  async handle(
    @Query(fetchEmployeesParamsPipe) params: PaginationQueryParamDTO,
    @TargetTenant() tenantId: string,
    @User() user: TokenPayload,
  ) {
    const result = await this.fetchEmployeesUseCase.execute({
      tenantId,
      callerRole: user.role,
      params,
    })

    if (result.isLeft()) {
      throw result.value
    }

    const { employees, meta } = result.value

    return {
      items: employees.map(HttpUserPresenter.toHttp),
      meta,
    }
  }
}
