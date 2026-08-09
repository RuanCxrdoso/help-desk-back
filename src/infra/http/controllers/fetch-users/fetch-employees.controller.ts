import { FetchEmployeesUseCase } from '@/domain/help-desk/application/use-cases/fetch-employees'
import {
  BadRequestException,
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
import { ROLE } from '@/core/enums/role'
import { HttpUserPresenter } from '@/infra/presenters/http-user.presenter'

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
    @Query(fetchEmployeesParamsPipe)
    { tenantId: paramTenantId, ...params }: PaginationQueryParamDTO,
    @User() user: TokenPayload,
  ) {
    let tenantId: string
    const { role: callerRole, tenantId: tokenTenantId } = user

    if (callerRole === ROLE.SUPER_ADMIN) {
      if (!paramTenantId) {
        throw new BadRequestException('Missing tenantId parameter')
      }

      tenantId = paramTenantId
    } else {
      tenantId = tokenTenantId
    }

    const result = await this.fetchEmployeesUseCase.execute({
      tenantId,
      callerRole,
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
