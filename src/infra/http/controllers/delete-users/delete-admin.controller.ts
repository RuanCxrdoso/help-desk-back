import { DeleteAdminUseCase } from '@/domain/help-desk/application/use-cases/delete-admin'
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

@Controller('/admins')
export class DeleteAdminController {
  constructor(private readonly deleteAdminUseCase: DeleteAdminUseCase) {}

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Delete, 'User'))
  async handle(
    @Param('id') targetAdminId: string,
    @TargetTenant() targetTenantId: string,
    @User() user: TokenPayload,
  ) {
    const result = await this.deleteAdminUseCase.execute({
      id: targetAdminId,
      tenantId: targetTenantId,
      callerPayload: user,
    })

    if (result.isLeft()) {
      throw result.value
    }
  }
}
