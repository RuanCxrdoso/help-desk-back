import { Employee } from '../../enterprise/entities/employee'
import { EmailValueObject } from '../../enterprise/entities/value-objects/email-value-object'
import { Either, left, right } from '@/core/error/either'
import { IHashGenerator } from '../cryptography/hash-generator'
import { UserAlreadyExistsError } from '../errors/user-already-exists-error'
import { IEmployeesRepository } from '../repositories/employees-repository'
import { NotAllowedError } from '../errors/not-allowed-error'
import { IAdminsRepository } from '../repositories/admins-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ITenantsRepository } from '../repositories/tenants-repository'
import { NotFoundError } from '../errors/not-found-error'

export interface RegisterEmployeeUseCaseRequest {
  creatorId: string
  firstName: string
  lastName: string
  email: string
  password: string
  tenantId: string
}

export type RegisterEmployeeUseCaseResponse = Either<
  NotAllowedError | UserAlreadyExistsError | NotFoundError,
  null
>

export class RegisterEmployeeUseCase {
  constructor(
    private tenantsRepository: ITenantsRepository,
    private employeesRepository: IEmployeesRepository,
    private adminsRepository: IAdminsRepository,
    private hashGenerator: IHashGenerator,
  ) {}

  async execute({
    creatorId,
    password,
    tenantId,
    email,
    ...data
  }: RegisterEmployeeUseCaseRequest): Promise<RegisterEmployeeUseCaseResponse> {
    const tenant = await this.tenantsRepository.findById(tenantId)

    if (!tenant) return left(new NotFoundError())

    const creator = await this.adminsRepository.findById(creatorId, tenantId)

    if (!creator) return left(new NotAllowedError())

    const employeeWithSameEmail = await this.employeesRepository.findByEmail(
      email,
      tenantId,
    )

    if (employeeWithSameEmail) return left(new UserAlreadyExistsError())

    const hashedPassword = await this.hashGenerator.hash(password)

    const employeeData = {
      ...data,
      password: hashedPassword,
      email: EmailValueObject.create(email),
      tenantId: new UniqueEntityID(tenantId),
    }

    const employee = Employee.create(employeeData)

    await this.employeesRepository.create(employee)

    return right(null)
  }
}
