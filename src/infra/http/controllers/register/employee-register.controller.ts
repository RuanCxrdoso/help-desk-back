import { RegisterEmployeeUseCase } from '@/domain/help-desk/application/use-cases/register-employee'
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ZodValidationPipe } from '../../utils/pipes/zod-validation.pipe'
import z from 'zod'
import { User } from '../../utils/decorators/user.decorator'
import { type TokenPayload } from '../../auth/jwt.strategy'
import { PoliciesGuard } from '../../auth/casl/policies.guard'
import { CheckPolicies } from '../../auth/casl/check-policies.decorator'
import { Action } from '../../auth/casl/action'
import { NotAllowedError } from '@/domain/help-desk/application/errors/not-allowed-error'

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

type EmployeeRegisterBodyDTO = z.infer<typeof employeeRegisterBodySchema>

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
    @Body(registerEmployeePipe) body: EmployeeRegisterBodyDTO,
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

    const { sub } = user

    if (!user.tenantId) {
      throw new NotAllowedError(
        'A tenant context is required to register an employee.',
      )
    }

    const result = await this.registerEmployeeUseCase.execute({
      creatorId: sub,
      tenantId: user.tenantId,
      firstName,
      lastName,
      email,
      password,
      isActive: isActive ?? true,
      department,
      jobTitle,
      location,
    })

    if (result.isLeft()) {
      throw result.value
    }

    return {
      message: 'Employee was successfully created.',
    }
  }
}
