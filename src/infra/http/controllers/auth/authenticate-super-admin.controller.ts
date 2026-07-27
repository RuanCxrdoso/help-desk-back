import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { Public } from '../../auth/public.decorator'
import z from 'zod'
import { ZodValidationPipe } from '../../utils/pipes/zod-validation.pipe'
import { AuthenticateSuperAdminUseCase } from '@/domain/help-desk/application/use-cases/authenticate-super-admin'

const authenticateSuperAdminSchema = z.object({
  email: z.email().min(1, { error: 'E-mail must be provided.' }),
  password: z
    .string()
    .min(6, { error: 'Password must have at least 6 characters.' }),
})

type AuthenticateSuperAdminBodyDTO = z.infer<
  typeof authenticateSuperAdminSchema
>

const authenticateSuperAdminBodyPipe = new ZodValidationPipe(
  authenticateSuperAdminSchema,
)

@Controller('/auth')
export class AuthenticateSuperAdminController {
  constructor(
    private readonly authenticateSuperAdminUseCase: AuthenticateSuperAdminUseCase,
  ) {}

  @Post('/super-admin/login')
  @HttpCode(HttpStatus.OK)
  @Public()
  async handle(
    @Body(authenticateSuperAdminBodyPipe) body: AuthenticateSuperAdminBodyDTO,
  ) {
    const { email, password } = body

    const result = await this.authenticateSuperAdminUseCase.execute({
      email,
      password,
    })

    if (result.isLeft()) {
      throw result.value
    }

    const accessToken = result.value.accessToken

    return {
      access_token: accessToken,
    }
  }
}
