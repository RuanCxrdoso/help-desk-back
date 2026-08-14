import { UpdateTechnicianUseCase } from '@/domain/help-desk/application/use-cases/update-technician'
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

const updateTechnicianSchema = z.object({
  firstName: z.string().min(1, { error: 'First name must be provided' }),
  lastName: z.string().min(1, { error: 'Last name must be provided' }),
  supportLevel: z.coerce
    .number()
    .min(1, { error: 'Support level must be greater than 0' })
    .max(5, { error: 'Support level must be less than 6' }),
  specialties: z.array(
    z.string().min(1, { error: 'Specialties must be provided' }),
  ),
})

type UpdateTechnicianBodyDTO = z.infer<typeof updateTechnicianSchema>

const updateTechnicianBodyPipe = new ZodValidationPipe(updateTechnicianSchema)

@Controller('/technicians')
export class UpdateTechnicianController {
  constructor(
    private readonly updateTechnicianUseCase: UpdateTechnicianUseCase,
  ) {}

  @Put('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Update, 'User'))
  async handle(
    @Param('id') targetTechnicianId: string,
    @Body(updateTechnicianBodyPipe) body: UpdateTechnicianBodyDTO,
    @User() user: TokenPayload,
  ) {
    const { tenantId } = user

    const result = await this.updateTechnicianUseCase.execute({
      id: targetTechnicianId,
      callerPayload: user,
      tenantId,
      ...body,
    })

    if (result.isLeft()) {
      throw result.value
    }
  }
}
