import { Either, left, right } from '@/core/error/either'
import { Admin } from '../../enterprise/entities/admin'
import { Employee } from '../../enterprise/entities/employee'
import { SuperAdmin } from '../../enterprise/entities/super-admin'
import { Technician } from '../../enterprise/entities/technician'
import { IAdminsRepository } from '../repositories/admins-repository'
import { IEmployeesRepository } from '../repositories/employees-repository'
import { ISuperAdminsRepository } from '../repositories/super-admins-repository'
import { ITechniciansRepository } from '../repositories/technicians-repository'
import { InvalidCredentialsError } from '../errors/invalida-credentials-error'
import { IHashComparer } from '../cryptography/hash-comparer'
import { IEncrypter } from '../cryptography/encrypter'

interface AuthenticateRequest {
  email: string
  password: string
}

type AuthenticateResponse = Either<
  InvalidCredentialsError,
  { accessToken: string }
>

export class AuthenticateUseCase {
  constructor(
    private superAdminsRepository: ISuperAdminsRepository,
    private adminsRepository: IAdminsRepository,
    private techniciansRepository: ITechniciansRepository,
    private employeesRepository: IEmployeesRepository,
    private hashComparer: IHashComparer,
    private encrypter: IEncrypter,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateRequest): Promise<AuthenticateResponse> {
    let account: Employee | Technician | Admin | SuperAdmin | null = null

    account = await this.employeesRepository.findByEmail(email)
    if (!account) account = await this.techniciansRepository.findByEmail(email)
    if (!account) account = await this.adminsRepository.findByEmail(email)
    if (!account) account = await this.superAdminsRepository.findByEmail(email)

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
