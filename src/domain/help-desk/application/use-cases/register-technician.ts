import { Technician } from '../../enterprise/entities/technician'
import { EmailValueObject } from '../../enterprise/entities/value-objects/email-value-object'
import { Either, left, right } from '@/core/error/either'
import { IHashGenerator } from '../cryptography/hash-generator'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import { ITechniciansRepository } from '../repositories/technicians-repository'
import { NotAllowedError } from '../errors/not-allowed-error'
import { IAdminsRepository } from '../repositories/admins-repository'

export interface RegisterTechnicianUseCaseRequest {
  creatorId: string
  firstName: string
  lastName: string
  email: string
  password: string
}

export type RegisterTechnicianUseCaseResponse = Either<
  NotAllowedError | UserAlreadyExistsError,
  null
>

export class RegisterTechnicianUseCase {
  constructor(
    private techniciansRepository: ITechniciansRepository,
    private adminsRepository: IAdminsRepository,
    private hashGenerator: IHashGenerator,
  ) {}

  async execute({
    creatorId,
    password,
    ...data
  }: RegisterTechnicianUseCaseRequest): Promise<RegisterTechnicianUseCaseResponse> {
    const creator = await this.adminsRepository.findById(creatorId)

    if (!creator) return left(new NotAllowedError())

    const technicianWithSameEmail =
      await this.techniciansRepository.findByEmail(data.email)

    if (technicianWithSameEmail) return left(new UserAlreadyExistsError())

    const hashedPassword = await this.hashGenerator.hash(password)

    const technicianData = {
      ...data,
      password: hashedPassword,
      email: EmailValueObject.create(data.email),
    }

    const technician = Technician.create(technicianData)

    await this.techniciansRepository.create(technician)

    return right(null)
  }
}
