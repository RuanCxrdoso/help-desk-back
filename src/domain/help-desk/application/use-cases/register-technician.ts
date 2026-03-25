import { Technician } from '../../enterprise/entities/technician'
import { EmailValueObject } from '../../enterprise/entities/value-objects/email-value-object'
import { Either, left, right } from '@/core/error/either'
import { IHashGenerator } from '../cryptography/hash-generator'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import { ITechniciansRepository } from '../repositories/technicians-repository'
import { NotAllowedError } from '../errors/not-allowed-error'
import { IAdminsRepository } from '../repositories/admins-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ITenantsRepository } from '../repositories/tenants-repository'
import { NotFoundError } from '../errors/not-found-error'

export interface RegisterTechnicianUseCaseRequest {
  creatorId: string
  firstName: string
  lastName: string
  email: string
  password: string
  tenantId: string
}

export type RegisterTechnicianUseCaseResponse = Either<
  NotAllowedError | UserAlreadyExistsError | NotFoundError,
  null
>

export class RegisterTechnicianUseCase {
  constructor(
    private tenantsRepository: ITenantsRepository,
    private techniciansRepository: ITechniciansRepository,
    private adminsRepository: IAdminsRepository,
    private hashGenerator: IHashGenerator,
  ) {}

  async execute({
    creatorId,
    password,
    tenantId,
    email,
    ...data
  }: RegisterTechnicianUseCaseRequest): Promise<RegisterTechnicianUseCaseResponse> {
    const tenant = await this.tenantsRepository.findById(tenantId)

    if (!tenant) return left(new NotFoundError())

    const creator = await this.adminsRepository.findById(creatorId, tenantId)

    if (!creator) return left(new NotAllowedError())

    const technicianWithSameEmail =
      await this.techniciansRepository.findByEmail(email, tenantId)

    if (technicianWithSameEmail) return left(new UserAlreadyExistsError())

    const hashedPassword = await this.hashGenerator.hash(password)

    const technicianData = {
      ...data,
      password: hashedPassword,
      email: EmailValueObject.create(email),
      tenantId: new UniqueEntityID(tenantId),
    }

    const technician = Technician.create(technicianData)

    await this.techniciansRepository.create(technician)

    return right(null)
  }
}
