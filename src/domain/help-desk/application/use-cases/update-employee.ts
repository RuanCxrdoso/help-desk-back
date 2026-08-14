import { Injectable } from '@nestjs/common'
import { IEmployeesRepository } from '../repositories/employees-repository'
import { Either, left, right } from '@/core/error/either'
import { NotFoundError } from '../errors/not-found-error'
import { Employee } from '../../enterprise/entities/employee'
import { TokenPayload } from '@/infra/http/auth/jwt.strategy'
import { NotAllowedError } from '../errors/not-allowed-error'
import { IAuthorizationService } from '../auth/authorization.service'

interface UpdateEmployeeUseCaseRequest {
  id: string
  tenantId?: string
  callerPayload: TokenPayload
  firstName: string
  lastName: string
  department: string
  jobTitle: string
  location: string
}

type UpdateEmployeeUseCaseResponse = Either<
  NotFoundError | NotAllowedError,
  { employee: Employee }
>

@Injectable()
export class UpdateEmployeeUseCase {
  constructor(
    private readonly employeesRepository: IEmployeesRepository,
    private readonly authService: IAuthorizationService,
  ) {}

  async execute({
    id,
    tenantId,
    callerPayload,
    firstName,
    lastName,
    department,
    jobTitle,
    location,
  }: UpdateEmployeeUseCaseRequest): Promise<UpdateEmployeeUseCaseResponse> {
    const employee = await this.employeesRepository.findById(id, tenantId)

    if (!employee) return left(new NotFoundError())

    if (
      !this.authService.authorize(callerPayload, 'update', 'User', employee)
    ) {
      return left(new NotAllowedError())
    }

    employee.firstName = firstName
    employee.lastName = lastName
    employee.department = department
    employee.jobTitle = jobTitle
    employee.location = location

    await this.employeesRepository.save(employee)

    return right({ employee })
  }
}
