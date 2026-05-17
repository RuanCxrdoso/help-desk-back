import { ROLE } from '@/core/enums/role'
import { IEmployeesRepository } from '../repositories/employees-repository'
import { Either, left, right } from '@/core/error/either'
import { NotAllowedError } from '../errors/not-allowed-error'
import { NotFoundError } from '../errors/not-found-error'
import { Employee } from '../../enterprise/entities/employee'

interface GetEmployeeProfileUseCaseRequest {
  id: string
  tenantId: string
  role: string
}

type GetEmployeeProfileUseCaseResponse = Either<
  NotAllowedError | NotFoundError,
  { employee: Employee }
>

export class GetEmployeeProfileUseCase {
  constructor(private employeesRepository: IEmployeesRepository) {}

  async execute({
    id,
    tenantId,
    role,
  }: GetEmployeeProfileUseCaseRequest): Promise<GetEmployeeProfileUseCaseResponse> {
    if (role !== ROLE.EMPLOYEE) {
      return left(new NotAllowedError())
    }

    const employee = await this.employeesRepository.findById(id, tenantId)

    if (!employee) {
      return left(new NotFoundError())
    }

    return right({ employee })
  }
}
