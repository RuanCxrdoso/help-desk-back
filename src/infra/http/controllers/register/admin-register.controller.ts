import { RegisterAdminUseCase } from '@/domain/help-desk/application/use-cases/register-admin'
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
import { TargetTenant } from '../../utils/decorators/target-tenant.decorator'

const adminRegisterBodySchema = z.object({
  firstName: z.string().min(2, { error: 'First name must be provided' }),
  lastName: z.string().min(2, { error: 'Last name must be provided' }),
  email: z.email().min(1, { error: 'E-mail must be provided' }),
  password: z
    .string()
    .min(6, { error: 'Password must be at least six characters' }),
  department: z.string().min(1, { error: 'Department must be provided' }),
  jobTitle: z.string().min(1, { error: 'Job title must be provided' }),
  isActive: z.boolean().optional().default(true),
})

type AdminRegisterBodyDTO = z.infer<typeof adminRegisterBodySchema>

const adminRegisterBodyPipe = new ZodValidationPipe(adminRegisterBodySchema)

@Controller('/admins')
export class AdminRegisterController {
  constructor(private readonly registerAdminUseCase: RegisterAdminUseCase) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Create, 'User'))
  async handle(
    @Body(adminRegisterBodyPipe) body: AdminRegisterBodyDTO,
    @TargetTenant() tenantId: string,
  ) {
    const {
      firstName,
      lastName,
      email,
      password,
      department,
      jobTitle,
      isActive,
    } = body

    const result = await this.registerAdminUseCase.execute({
      tenantId,
      firstName,
      lastName,
      email,
      password,
      department,
      jobTitle,
      isActive,
    })

    if (result.isLeft()) {
      throw result.value
    }

    return {
      message: 'Administrator was successfully created.',
    }
  }
}
