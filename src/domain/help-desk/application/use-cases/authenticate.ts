import { Either, left, right } from '@/core/error/either'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error'
import { IHashComparer } from '../cryptography/hash-comparer'
import { IEncrypter } from '../cryptography/encrypter'
import { ITenantsRepository } from '../repositories/tenants-repository'
import { NotFoundError } from '../errors/not-found-error'
import { IUsersRepository } from '../repositories/users-repository'
import { TENANT_STATUS } from 'generated/prisma/enums'

interface AuthenticateRequest {
  email: string
  password: string
  tenantSlug: string // This information will come from the subdomain in the request (www.tenant-slug.helpdesk.com)
}

type AuthenticateResponse = Either<
  InvalidCredentialsError | NotFoundError,
  { accessToken: string }
>

export class AuthenticateUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private tenantsRepository: ITenantsRepository,
    private hashComparer: IHashComparer,
    private encrypter: IEncrypter,
  ) {}

  async execute({
    email,
    password,
    tenantSlug,
  }: AuthenticateRequest): Promise<AuthenticateResponse> {
    const tenant = await this.tenantsRepository.findBySlug(tenantSlug)

    if (!tenant || tenant.status !== TENANT_STATUS.ACTIVE)
      return left(new InvalidCredentialsError())

    const { id: tenantId } = tenant

    const user = await this.usersRepository.findByEmail(
      email,
      tenantId.toString(),
    )

    if (!user) return left(new InvalidCredentialsError())

    const isPasswordMatch = await this.hashComparer.compare(
      password,
      user.password,
    )

    if (!isPasswordMatch) return left(new InvalidCredentialsError())

    const accessToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
      role: user.role,
      tenantId: user.tenantId.toString(),
    })

    return right({
      accessToken,
    })
  }
}
