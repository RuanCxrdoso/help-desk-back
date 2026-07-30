import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common'
import { Public } from '../../auth/public.decorator'
import z from 'zod'
import { ZodValidationPipe } from '../../utils/pipes/zod-validation.pipe'
import { AuthenticateUseCase } from '@/domain/help-desk/application/use-cases/authenticate'

const authenticateBodySchema = z.object({
  email: z.email().min(1, { error: 'E-mail must be provided.' }),
  password: z
    .string()
    .min(6, { error: 'Password must be at least 6 characters.' }),
})

type AuthenticateBodyDTO = z.infer<typeof authenticateBodySchema>

const authenticateBodyPipe = new ZodValidationPipe(authenticateBodySchema)

@Controller('/auth')
export class AuthenticateController {
  constructor(private readonly authenticateUseCase: AuthenticateUseCase) {}

  @Post('/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handle(
    @Body(authenticateBodyPipe) body: AuthenticateBodyDTO,
    @Headers('x-tenant-slug') tenantSlug: string,
  ) {
    if (!tenantSlug) {
      throw new BadRequestException('x-tenant-slug header is required.')
    }

    const { email, password } = body

    const result = await this.authenticateUseCase.execute({
      email,
      password,
      tenantSlug,
    })

    if (result.isLeft()) {
      throw result.value
    }

    const { accessToken } = result.value

    return {
      access_token: accessToken,
    }
  }
}
