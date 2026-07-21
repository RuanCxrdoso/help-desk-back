import { RegisterAdminUseCase } from '@/domain/help-desk/application/use-cases/register-admin'
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

type AdminRegisterBodyType = z.infer<typeof adminRegisterBodySchema>

const adminRegisterBodyPipe = new ZodValidationPipe(adminRegisterBodySchema)

@Controller('/admins')
export class AdminRegisterController {
  constructor(private readonly registerAdminUseCase: RegisterAdminUseCase) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Create, 'User'))
  async handle(
    @Body(adminRegisterBodyPipe) body: AdminRegisterBodyType,
    @User() user: TokenPayload,
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
    const { sub, tenantId } = user

    const result = await this.registerAdminUseCase.execute({
      creatorId: sub,
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
      message: 'Administrator was successfully created.',
    }
  }
}
