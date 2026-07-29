import { Technician } from '../../enterprise/entities/technician'
import { EmailValueObject } from '../../enterprise/entities/value-objects/email-value-object'
import { Either, left, right } from '@/core/error/either'
import { IHashGenerator } from '../cryptography/hash-generator'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import { ITechniciansRepository } from '../repositories/technicians-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ITenantsRepository } from '../repositories/tenants-repository'
import { NotFoundError } from '../errors/not-found-error'
import { IUsersRepository } from '../repositories/users-repository'
import { Injectable } from '@nestjs/common'

export interface RegisterTechnicianUseCaseRequest {
  tenantId: string
  firstName: string
  lastName: string
  email: string
  password: string
  isActive: boolean
  supportLevel: number
  specialties: string[]
}

export type RegisterTechnicianUseCaseResponse = Either<
  UserAlreadyExistsError | NotFoundError,
  null
>

@Injectable()
export class RegisterTechnicianUseCase {
  constructor(
    private tenantsRepository: ITenantsRepository,
    private techniciansRepository: ITechniciansRepository,
    private usersRepository: IUsersRepository,
    private hashGenerator: IHashGenerator,
  ) {}

  async execute({
    password,
    tenantId,
    email,
    ...data
  }: RegisterTechnicianUseCaseRequest): Promise<RegisterTechnicianUseCaseResponse> {
    const tenant = await this.tenantsRepository.findById(tenantId)

    if (!tenant) return left(new NotFoundError())

    const technicianWithSameEmail = await this.usersRepository.findByEmail(
      email,
      tenantId,
    )

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
