import { Either, right, left } from '@/core/error/either'
import { IEmployeesRepository } from '../repositories/employees-repository'
import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../errors/not-found-error'

export interface DeleteEmployeeUseCaseRequest {
  id: string
  tenantId: string
}

type DeleteEmployeeUseCaseResponse = Either<NotFoundError, null>

@Injectable()
export class DeleteEmployeeUseCase {
  constructor(private readonly employeesRepository: IEmployeesRepository) {}

  async execute({
    id,
    tenantId,
  }: DeleteEmployeeUseCaseRequest): Promise<DeleteEmployeeUseCaseResponse> {
    const employee = await this.employeesRepository.findById(id, tenantId)

    if (!employee) {
      return left(new NotFoundError())
    }

    employee.deactivate()

    await this.employeesRepository.save(employee)

    return right(null)
  }
}
