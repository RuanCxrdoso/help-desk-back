import { UpdateEmployeeUseCase } from '@/domain/help-desk/application/use-cases/update-employee'
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common'
import { PoliciesGuard } from '../../auth/casl/policies.guard'
import { CheckPolicies } from '../../auth/casl/check-policies.decorator'
import { Action } from '../../auth/casl/action'
import z from 'zod'
import { ZodValidationPipe } from '../../utils/pipes/zod-validation.pipe'
import { User } from '../../utils/decorators/user.decorator'
import { type TokenPayload } from '../../auth/jwt.strategy'

const updateEmployeeSchema = z.object({
  firstName: z.string().min(1, { error: 'First name must be provided' }),
  lastName: z.string().min(1, { error: 'Last name must be provided' }),
  department: z.string().min(1, { error: 'Department must be provided' }),
  jobTitle: z.string().min(1, { error: 'Job title must be provided' }),
  location: z.string().min(1, { error: 'Location must be provided' }),
})

type UpdateEmployeeBodyDTO = z.infer<typeof updateEmployeeSchema>

const updateEmployeeBodyPipe = new ZodValidationPipe(updateEmployeeSchema)

@Controller('/employees')
export class UpdateEmployeeController {
  constructor(private readonly updateEmployeeUseCase: UpdateEmployeeUseCase) {}

  @Put('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Update, 'User'))
  async handle(
    @Param('id') targetEmployeeId: string,
    @Body(updateEmployeeBodyPipe) body: UpdateEmployeeBodyDTO,
    @User() user: TokenPayload,
  ) {
    const { tenantId } = user

    const result = await this.updateEmployeeUseCase.execute({
      id: targetEmployeeId,
      callerPayload: user,
      tenantId,
      ...body,
    })

    if (result.isLeft()) {
      throw result.value
    }
  }
}
