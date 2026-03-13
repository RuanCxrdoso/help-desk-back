import { Employee } from '../../enterprise/entities/employee'
import { EmailValueObject } from '../../enterprise/entities/value-objects/email-value-object'
import { Either, left, right } from '@/core/error/either'
import { IHashGenerator } from '../cryptography/hash-generator'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import { IEmployeesRepository } from '../repositories/employees-repository'
import { NotAllowedError } from '../errors/not-allowed-error'
import { IAdminsRepository } from '../repositories/admins-repository'

export interface RegisterEmployeeUseCaseRequest {
  creatorId: string
  firstName: string
  lastName: string
  email: string
  password: string
}

export type RegisterEmployeeUseCaseResponse = Either<
  NotAllowedError | UserAlreadyExistsError,
  null
>

export class RegisterEmployeeUseCase {
  constructor(
    private employeesRepository: IEmployeesRepository,
    private adminsRepository: IAdminsRepository,
    private hashGenerator: IHashGenerator,
  ) {}

  async execute({
    creatorId,
    password,
    ...data
  }: RegisterEmployeeUseCaseRequest): Promise<RegisterEmployeeUseCaseResponse> {
    const creator = await this.adminsRepository.findById(creatorId)

    if (!creator) return left(new NotAllowedError())

    const employeeWithSameEmail = await this.employeesRepository.findByEmail(
      data.email,
    )

    if (employeeWithSameEmail) return left(new UserAlreadyExistsError())

    const hashedPassword = await this.hashGenerator.hash(password)

    const employeeData = {
      ...data,
      password: hashedPassword,
      email: EmailValueObject.create(data.email),
    }

    const employee = Employee.create(employeeData)

    await this.employeesRepository.create(employee)

    return right(null)
  }
}
