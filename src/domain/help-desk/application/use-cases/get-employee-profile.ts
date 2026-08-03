import { IEmployeesRepository } from '../repositories/employees-repository'
import { Either, left, right } from '@/core/error/either'
import { NotFoundError } from '../errors/not-found-error'
import { Employee } from '../../enterprise/entities/employee'
import { Injectable } from '@nestjs/common'

interface GetEmployeeProfileUseCaseRequest {
  id: string
  tenantId: string
}

type GetEmployeeProfileUseCaseResponse = Either<
  NotFoundError,
  { employee: Employee }
>

@Injectable()
export class GetEmployeeProfileUseCase {
  constructor(private employeesRepository: IEmployeesRepository) {}

  async execute({
    id,
    tenantId,
  }: GetEmployeeProfileUseCaseRequest): Promise<GetEmployeeProfileUseCaseResponse> {
    const employee = await this.employeesRepository.findById(id, tenantId)

    if (!employee) {
      return left(new NotFoundError())
    }

    return right({ employee })
  }
}
