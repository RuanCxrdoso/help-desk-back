import { Either, left, right } from '@/core/error/either'
import { Admin } from '../../enterprise/entities/admin'
import { Employee } from '../../enterprise/entities/employee'
import { SuperAdmin } from '../../enterprise/entities/super-admin'
import { Technician } from '../../enterprise/entities/technician'
import { IAdminsRepository } from '../repositories/admins-repository'
import { IEmployeesRepository } from '../repositories/employees-repository'
import { ITechniciansRepository } from '../repositories/technicians-repository'
import { InvalidCredentialsError } from '../errors/invalid-credentials-error'
import { IHashComparer } from '../cryptography/hash-comparer'
import { IEncrypter } from '../cryptography/encrypter'
import { ITenantsRepository } from '../repositories/tenants-repository'
import { NotFoundError } from '../errors/not-found-error'

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
    private adminsRepository: IAdminsRepository,
    private techniciansRepository: ITechniciansRepository,
    private employeesRepository: IEmployeesRepository,
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

    if (!tenant) return left(new NotFoundError())

    const { id: tenantId } = tenant

    let account: Employee | Technician | Admin | SuperAdmin | null = null

    account = await this.employeesRepository.findByEmail(
      email,
      tenantId.toString(),
    )

    if (!account) {
      account = await this.techniciansRepository.findByEmail(
        email,
        tenantId.toString(),
      )
    }

    if (!account) {
      account = await this.adminsRepository.findByEmail(
        email,
        tenantId.toString(),
      )
    }

    if (!account) return left(new InvalidCredentialsError())

    const isPasswordMatch = await this.hashComparer.compare(
      password,
      account.password,
    )

    if (!isPasswordMatch) return left(new InvalidCredentialsError())

    const accessToken = await this.encrypter.encrypt({
      sub: account.id.toString(),
      role: account.role,
      tenantId: account.tenantId.toString(),
    })

    return right({
      accessToken,
    })
  }
}
