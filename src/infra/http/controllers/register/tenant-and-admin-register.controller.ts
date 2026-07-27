import { RegisterTenantAndAdminUseCase } from '@/domain/help-desk/application/use-cases/register-tenant-and-admin'
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common'
import { PoliciesGuard } from '../../auth/casl/policies.guard'
import { CheckPolicies } from '../../auth/casl/check-policies.decorator'
import { Action } from '../../auth/casl/action'
import z from 'zod'
import { ZodValidationPipe } from '../../utils/pipes/zod-validation.pipe'
import { TENANT_STATUS } from '@/core/enums/tenant_status'

const tenantAndAdminRegisterBodySchema = z.object({
  tenant: z.object({
    name: z.string().min(2, { error: 'Name must be provided.' }),
    slug: z.string().min(2, { error: 'Slug must be provided.' }),
    status: z.enum([
      TENANT_STATUS.ACTIVE,
      TENANT_STATUS.SUSPENDED,
      TENANT_STATUS.CANCELLED,
    ]),
  }),
  admin: z.object({
    firstName: z.string().min(2, { error: 'First name must be provided.' }),
    lastName: z.string().min(2, { error: 'Last name must be provided.' }),
    email: z.email().min(1, { error: 'E-mail must be provided.' }),
    password: z
      .string()
      .min(6, { error: 'Password must be at least 6 characters.' }),
    department: z.string().min(1, { error: 'Department must be provided.' }),
    jobTitle: z.string().min(1, { error: 'Job title must be provided.' }),
    isActive: z.boolean().optional().default(true),
  }),
})

type TenantAndAdminRegisterBodyDTO = z.infer<
  typeof tenantAndAdminRegisterBodySchema
>

const tenantAndAdminRegisterBodyPipe = new ZodValidationPipe(
  tenantAndAdminRegisterBodySchema,
)

@Controller('/tenants')
export class TenantAndAdminRegisterController {
  constructor(
    private readonly registerTenantAndAdminUseCase: RegisterTenantAndAdminUseCase,
  ) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PoliciesGuard)
  @CheckPolicies(
    (ability) => ability.can(Action.Create, 'Tenant'),
    (ability) => ability.can(Action.Create, 'User'),
  )
  async handle(
    @Body(tenantAndAdminRegisterBodyPipe) body: TenantAndAdminRegisterBodyDTO,
  ) {
    const { tenant, admin } = body

    const result = await this.registerTenantAndAdminUseCase.execute({
      tenant,
      admin,
    })

    if (result.isLeft()) {
      throw result.value
    }

    return {
      message: 'Tenant and admin were successfully created.',
    }
  }
}
