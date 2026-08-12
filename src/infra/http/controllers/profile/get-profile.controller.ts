import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import { GetAdminProfileUseCase } from '@/domain/help-desk/application/use-cases/get-admin-profile'
import { GetEmployeeProfileUseCase } from '@/domain/help-desk/application/use-cases/get-employee-profile'
import { GetTechnicianProfileUseCase } from '@/domain/help-desk/application/use-cases/get-technician-profile'
import { PoliciesGuard } from '../../auth/casl/policies.guard'
import { CheckPolicies } from '../../auth/casl/check-policies.decorator'
import { User } from '../../utils/decorators/user.decorator'
import { type TokenPayload } from '../../auth/jwt.strategy'
import { ROLE } from '@/core/enums/role'
import { Action } from '../../auth/casl/action'
import {
  HttpAdminProfilePresenter,
  HttpEmployeeProfilePresenter,
  HttpSuperAdminProfilePresenter,
  HttpTechnicianProfilePresenter,
} from '@/infra/presenters/http-profile.presenter'
import { NotAllowedError } from '@/domain/help-desk/application/errors/not-allowed-error'
import { GetSuperAdminProfileUseCase } from '@/domain/help-desk/application/use-cases/get-super-admin-profile'

@Controller()
export class GetProfileController {
  constructor(
    private readonly getSuperAdminProfileUseCase: GetSuperAdminProfileUseCase,
    private readonly getAdminProfileUseCase: GetAdminProfileUseCase,
    private readonly getTechnicianProfileUseCase: GetTechnicianProfileUseCase,
    private readonly getEmployeeProfileUseCase: GetEmployeeProfileUseCase,
  ) {}

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Read, 'User'))
  async handle(@User() user: TokenPayload) {
    const { sub: id, role } = user

    switch (role) {
      case ROLE.SUPER_ADMIN: {
        const result = await this.getSuperAdminProfileUseCase.execute({
          id,
          role,
        })

        if (result.isLeft()) throw result.value

        const superAdminDomain = result.value.superAdmin

        return HttpSuperAdminProfilePresenter.toHttp(superAdminDomain)
      }
      case ROLE.ADMIN: {
        const result = await this.getAdminProfileUseCase.execute({
          id,
          tenantId: user.tenantId,
          callerPayload: user,
        })

        if (result.isLeft()) throw result.value

        const adminDomain = result.value.admin

        return HttpAdminProfilePresenter.toHttp(adminDomain)
      }
      case ROLE.TECHNICIAN: {
        const result = await this.getTechnicianProfileUseCase.execute({
          id,
          tenantId: user.tenantId,
          callerPayload: user,
        })

        if (result.isLeft()) throw result.value

        const technicianDomain = result.value.technician

        return HttpTechnicianProfilePresenter.toHttp(technicianDomain)
      }
      case ROLE.EMPLOYEE: {
        const result = await this.getEmployeeProfileUseCase.execute({
          id,
          tenantId: user.tenantId,
          callerPayload: user,
        })

        if (result.isLeft()) throw result.value

        const employeeDomain = result.value.employee

        return HttpEmployeeProfilePresenter.toHttp(employeeDomain)
      }
      default: {
        throw new NotAllowedError('Invalid role.')
      }
    }
  }
}
