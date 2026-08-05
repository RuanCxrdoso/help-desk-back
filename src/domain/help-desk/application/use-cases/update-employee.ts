import { Injectable } from '@nestjs/common'
import { IEmployeesRepository } from '../repositories/employees-repository'
import { Either, left, right } from '@/core/error/either'
import { NotFoundError } from '../errors/not-found-error'
import { Employee } from '../../enterprise/entities/employee'

interface UpdateEmployeeUseCaseRequest {
  id: string
  tenantId: string
  firstName: string
  lastName: string
  department: string
  jobTitle: string
  location: string
}

type UpdateEmployeeUseCaseResponse = Either<
  NotFoundError,
  { employee: Employee }
>

@Injectable()
export class UpdateEmployeeUseCase {
  constructor(private readonly employeesRepository: IEmployeesRepository) {}

  async execute({
    id,
    tenantId,
    firstName,
    lastName,
    department,
    jobTitle,
    location,
  }: UpdateEmployeeUseCaseRequest): Promise<UpdateEmployeeUseCaseResponse> {
    const employee = await this.employeesRepository.findById(id, tenantId)

    if (!employee) return left(new NotFoundError())

    employee.firstName = firstName
    employee.lastName = lastName
    employee.department = department
    employee.jobTitle = jobTitle
    employee.location = location

    await this.employeesRepository.save(employee)

    return right({ employee })
  }
}
