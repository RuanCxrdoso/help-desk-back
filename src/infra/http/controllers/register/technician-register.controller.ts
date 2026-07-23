import { RegisterTechnicianUseCase } from '@/domain/help-desk/application/use-cases/register-technician'
import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common'
import { PoliciesGuard } from '../../auth/casl/policies.guard'
import { CheckPolicies } from '../../auth/casl/check-policies.decorator'
import { Action } from '../../auth/casl/action'
import z from 'zod'
import { ZodValidationPipe } from '../../utils/pipes/zod-validation.pipe'
import { User } from '../../utils/decorators/user.decorator'
import { type TokenPayload } from '../../auth/jwt.strategy'
import { NotAllowedError } from '@/domain/help-desk/application/errors/not-allowed-error'
import { UserAlreadyExistsError } from '@/domain/help-desk/application/errors/user-already-exists-error'
import { NotFoundError } from '@/domain/help-desk/application/errors/not-found-error'

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
    @User() user: TokenPayload,
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

    const { sub, tenantId } = user

    const result = await this.registerTechnicianUseCase.execute({
      creatorId: sub,
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
      const error = result.value

      switch (error.constructor) {
        case NotAllowedError:
          throw new ForbiddenException(error.message)
        case UserAlreadyExistsError:
          throw new ConflictException(error.message)
        case NotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new ConflictException(error.message)
      }
    }

    return {
      message: 'Technician was successfully created.',
    }
  }
}
