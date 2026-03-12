import { ROLE, Role } from '@/core/enums/role'
import { IUsersRepository } from '../repositories/users-repository'
import { NotAllowedError } from '../errors/not-allowed-error'
import { NotFoundError } from '../errors/not-found-error'
import { Admin } from '../../enterprise/entities/admin'
import { Technician } from '../../enterprise/entities/technician'
import { Employee } from '../../enterprise/entities/employee'
import { EmailValueObject } from '../../enterprise/entities/value-objects/email-value-object'
import { Either, left, right } from '@/core/error/either'
import { IHashGenerator } from '../cryptography/hash-generator'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'

export interface RegisterUserUseCaseRequest {
  creatorId: string
  firstName: string
  lastName: string
  email: string
  password: string
  role: Role
}

export type RegisterUserUseCaseResponse = Either<
  NotFoundError | NotAllowedError,
  null
>

export class RegisterUserUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private hashGenerator: IHashGenerator,
  ) {}

  async execute({
    creatorId,
    password,
    role,
    ...data
  }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
    const creator = await this.usersRepository.findById(creatorId)

    if (!creator) return left(new NotFoundError())

    if (creator.role !== ROLE.ADMIN) return left(new NotAllowedError())

    const user = await this.usersRepository.findByEmail(data.email)

    if (user) return left(new UserAlreadyExistsError())

    const hashedPassword = await this.hashGenerator.hash(password)

    const userData = {
      ...data,
      password: hashedPassword,
      email: EmailValueObject.create(data.email),
    }

    switch (role) {
      case ROLE.ADMIN: {
        const admin = Admin.create(userData)

        await this.usersRepository.create(admin)

        break
      }

      case ROLE.TECHNICIAN: {
        const technician = Technician.create(userData)

        await this.usersRepository.create(technician)

        break
      }

      case ROLE.EMPLOYEE: {
        const employee = Employee.create(userData)

        await this.usersRepository.create(employee)

        break
      }
    }

    return right(null)
  }
}
