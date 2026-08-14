import { DeleteEmployeeUseCase } from '@/domain/help-desk/application/use-cases/delete-employee'
import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common'
import { PoliciesGuard } from '../../auth/casl/policies.guard'
import { CheckPolicies } from '../../auth/casl/check-policies.decorator'
import { Action } from '../../auth/casl/action'
import { TargetTenant } from '../../utils/decorators/target-tenant.decorator'
import { User } from '../../utils/decorators/user.decorator'
import { type TokenPayload } from '../../auth/jwt.strategy'

@Controller('/employees')
export class DeleteEmployeeController {
  constructor(private readonly deleteEmployeeUseCase: DeleteEmployeeUseCase) {}

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Delete, 'User'))
  async handle(
    @Param('id') targetEmployeeId: string,
    @TargetTenant() targetTenantId: string,
    @User() user: TokenPayload,
  ) {
    const result = await this.deleteEmployeeUseCase.execute({
      id: targetEmployeeId,
      tenantId: targetTenantId,
      callerPayload: user,
    })

    if (result.isLeft()) {
      throw result.value
    }
  }
}
