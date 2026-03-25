import { Either, left, right } from '@/core/error/either'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error'
import { IHashComparer } from '../cryptography/hash-comparer'
import { IEncrypter } from '../cryptography/encrypter'
import { NotFoundError } from '../errors/not-found-error'
import { ISuperAdminsRepository } from '../repositories/super-admins-repository'

interface AuthenticateSuperAdminRequest {
  email: string
  password: string
}

type AuthenticateSuperAdminResponse = Either<
  InvalidCredentialsError | NotFoundError,
  { accessToken: string }
>

export class AuthenticateSuperAdminUseCase {
  constructor(
    private superAdminsRepository: ISuperAdminsRepository,
    private hashComparer: IHashComparer,
    private encrypter: IEncrypter,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateSuperAdminRequest): Promise<AuthenticateSuperAdminResponse> {
    const account = await this.superAdminsRepository.findByEmail(email)

    if (!account) return left(new InvalidCredentialsError())

    const isPasswordMatch = await this.hashComparer.compare(
      password,
      account.password,
    )

    if (!isPasswordMatch) return left(new InvalidCredentialsError())

    const accessToken = await this.encrypter.encrypt({
      sub: account.id.toString(),
      role: account.role,
    })

    return right({
      accessToken,
    })
  }
}
