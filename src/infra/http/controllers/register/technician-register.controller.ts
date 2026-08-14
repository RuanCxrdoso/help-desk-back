import { RegisterTechnicianUseCase } from '@/domain/help-desk/application/use-cases/register-technician'
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

const technicianRegisterBodySchema = z.object({
  firstName: z.string().min(2, { error: 'First name must be provided' }),
  lastName: z.string().min(2, { error: 'Last name must be provided' }),
  email: z.email().min(1, { error: 'E-mail must be provided' }),
  password: z
    .string()
    .min(6, { error: 'Password must be at least 6 characters' }),
  isActive: z.boolean().optional().default(true),
  supportLevel: z.coerce
    .number()
    .min(1, { error: 'Support level must be greater than 0' })
    .max(5, { error: 'Support level must be less than 6' }),
  specialties: z.array(
    z.string().min(1, { error: 'Specialties must be provided' }),
  ),
  tenantId: z.uuid().optional(),
})

type TechnicianRegisterBodyDTO = z.infer<typeof technicianRegisterBodySchema>

const technicianRegisterBodyPipe = new ZodValidationPipe(
  technicianRegisterBodySchema,
)

@Controller('/technicians')
export class TechnicianRegisterController {
  constructor(
    private readonly registerTechnicianUseCase: RegisterTechnicianUseCase,
  ) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Create, 'User'))
  async handle(
    @Body(technicianRegisterBodyPipe) body: TechnicianRegisterBodyDTO,
    @TargetTenant() tenantId: string,
  ) {
    const {
      firstName,
      lastName,
      email,
      password,
      isActive,
      supportLevel,
      specialties,
    } = body

    const result = await this.registerTechnicianUseCase.execute({
      tenantId,
      firstName,
      lastName,
      email,
      password,
      isActive,
      supportLevel,
      specialties,
    })

    if (result.isLeft()) {
      throw result.value
    }

    return {
      message: 'Technician was successfully created.',
    }
  }
}
