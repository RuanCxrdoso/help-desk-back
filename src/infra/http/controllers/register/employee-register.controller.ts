import { RegisterEmployeeUseCase } from '@/domain/help-desk/application/use-cases/register-employee'
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
import { ZodValidationPipe } from '../../utils/pipes/zod-validation.pipe'
import z from 'zod'
import { User } from '../../utils/decorators/user.decorator'
import { type TokenPayload } from '../../auth/jwt.strategy'
import { NotAllowedError } from '@/domain/help-desk/application/errors/not-allowed-error'
import { UserAlreadyExistsError } from '@/domain/help-desk/application/errors/user-already-exists-error'
import { NotFoundError } from '@/domain/help-desk/application/errors/not-found-error'
import { PoliciesGuard } from '../../auth/casl/policies.guard'
import { CheckPolicies } from '../../auth/casl/check-policies.decorator'
import { Action } from '../../auth/casl/action'

const employeeRegisterBodySchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Invalid email format'),
  password: z.string().min(6, 'Password must contain at least 6 characters'),
  isActive: z.boolean().optional().default(true),
  department: z.string().min(1, 'Department is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  location: z.string().min(1, 'Location is required'),
})

type EmployeeRegisterBodyType = z.infer<typeof employeeRegisterBodySchema>

const registerEmployeePipe = new ZodValidationPipe(employeeRegisterBodySchema)

@Controller('/employees')
export class EmployeeRegisterController {
  constructor(
    private readonly registerEmployeeUseCase: RegisterEmployeeUseCase,
  ) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Manage, 'User'))
  async handle(
    @Body(registerEmployeePipe) body: EmployeeRegisterBodyType,
    @User() user: TokenPayload,
  ) {
    const {
      firstName,
      lastName,
      email,
      password,
      isActive,
      department,
      jobTitle,
      location,
    } = body

    const { sub, tenantId } = user

    const result = await this.registerEmployeeUseCase.execute({
      creatorId: sub,
      firstName,
      lastName,
      email,
      password,
      isActive: isActive ?? true,
      tenantId,
      department,
      jobTitle,
      location,
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
      message: 'Employee was successfully created.',
    }
  }
}
