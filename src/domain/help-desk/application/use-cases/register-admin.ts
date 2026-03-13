import { Admin } from '../../enterprise/entities/admin'
import { EmailValueObject } from '../../enterprise/entities/value-objects/email-value-object'
import { Either, left, right } from '@/core/error/either'
import { IHashGenerator } from '../cryptography/hash-generator'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import { IAdminsRepository } from '../repositories/admins-repository'
import { NotAllowedError } from '../errors/not-allowed-error'
import { ISuperAdminsRepository } from '../repositories/super-admins-repository'

export interface RegisterAdminUseCaseRequest {
  creatorId: string
  firstName: string
  lastName: string
  email: string
  password: string
}

export type RegisterAdminUseCaseResponse = Either<
  NotAllowedError | UserAlreadyExistsError,
  null
>

export class RegisterAdminUseCase {
  constructor(
    private adminsRepository: IAdminsRepository,
    private superAdminsRepository: ISuperAdminsRepository,
    private hashGenerator: IHashGenerator,
  ) {}

  async execute({
    creatorId,
    password,
    ...data
  }: RegisterAdminUseCaseRequest): Promise<RegisterAdminUseCaseResponse> {
    const creator = await this.superAdminsRepository.findById(creatorId)

    if (!creator) return left(new NotAllowedError())

    const adminWithSameEmail = await this.adminsRepository.findByEmail(
      data.email,
    )

    if (adminWithSameEmail) return left(new UserAlreadyExistsError())

    const hashedPassword = await this.hashGenerator.hash(password)

    const technicianData = {
      ...data,
      password: hashedPassword,
      email: EmailValueObject.create(data.email),
    }

    const admin = Admin.create(technicianData)

    await this.adminsRepository.create(admin)

    return right(null)
  }
}
