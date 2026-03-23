import { Admin } from '../../enterprise/entities/admin'
import { EmailValueObject } from '../../enterprise/entities/value-objects/email-value-object'
import { Either, left, right } from '@/core/error/either'
import { IHashGenerator } from '../cryptography/hash-generator'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import { IAdminsRepository } from '../repositories/admins-repository'
import { NotAllowedError } from '../errors/not-allowed-error'
import { ISuperAdminsRepository } from '../repositories/super-admins-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ITenantsRepository } from '../repositories/tenants-repository'
import { NotFoundError } from '../errors/not-found-error'

export interface RegisterAdminUseCaseRequest {
  creatorId: string
  firstName: string
  lastName: string
  email: string
  password: string
  tenantId: string
}

export type RegisterAdminUseCaseResponse = Either<
  NotAllowedError | UserAlreadyExistsError | NotFoundError,
  null
>

export class RegisterAdminUseCase {
  constructor(
    private tenantsRepository: ITenantsRepository,
    private adminsRepository: IAdminsRepository,
    private superAdminsRepository: ISuperAdminsRepository,
    private hashGenerator: IHashGenerator,
  ) {}

  async execute({
    creatorId,
    password,
    ...data
  }: RegisterAdminUseCaseRequest): Promise<RegisterAdminUseCaseResponse> {
    const tenantExists = await this.tenantsRepository.findById(data.tenantId)

    if (!tenantExists) return left(new NotFoundError())

    const creator = await this.superAdminsRepository.findById(creatorId)

    if (!creator) return left(new NotAllowedError())

    const adminWithSameEmail = await this.adminsRepository.findByEmail(
      data.email,
      data.tenantId,
    )

    if (adminWithSameEmail) return left(new UserAlreadyExistsError())

    const hashedPassword = await this.hashGenerator.hash(password)

    const adminData = {
      ...data,
      password: hashedPassword,
      email: EmailValueObject.create(data.email),
      tenantId: new UniqueEntityID(data.tenantId),
    }

    const admin = Admin.create(adminData)

    await this.adminsRepository.create(admin)

    return right(null)
  }
}
