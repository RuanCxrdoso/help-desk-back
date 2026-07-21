import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { Public } from '../../auth/public.decorator'
import z from 'zod'
import { ZodValidationPipe } from '../../utils/pipes/zod-validation.pipe'
import { AuthenticateSuperAdminUseCase } from '@/domain/help-desk/application/use-cases/authenticate-super-admin'
import { InvalidCredentialsError } from '@/domain/help-desk/application/errors/invalid-credentials-error'

const authenticateSuperAdminSchema = z.object({
  email: z.email().min(1, { error: 'E-mail must be provided.' }),
  password: z
    .string()
    .min(6, { error: 'Password must have at least 6 characters.' }),
})

type AuthenticateSuperAdminBodyType = z.infer<
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
    @Body(authenticateSuperAdminBodyPipe) body: AuthenticateSuperAdminBodyType,
  ) {
    const { email, password } = body

    const result = await this.authenticateSuperAdminUseCase.execute({
      email,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case InvalidCredentialsError:
          throw new UnauthorizedException('Invalid credentials.')
        default:
          throw new UnauthorizedException(error.message)
      }
    }

    const accessToken = result.value.accessToken

    return {
      access_token: accessToken,
    }
  }
}
