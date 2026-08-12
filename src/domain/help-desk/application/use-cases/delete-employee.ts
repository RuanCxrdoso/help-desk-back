import { Either, right, left } from '@/core/error/either'
import { IEmployeesRepository } from '../repositories/employees-repository'
import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../errors/not-found-error'
import { TokenPayload } from '@/infra/http/auth/jwt.strategy'
import { IAuthorizationService } from '../auth/authorization.service'
import { NotAllowedError } from '../errors/not-allowed-error'

export interface DeleteEmployeeUseCaseRequest {
  id: string
  tenantId: string
  callerPayload: TokenPayload
}

type DeleteEmployeeUseCaseResponse = Either<
  NotFoundError | NotAllowedError,
  null
>

@Injectable()
export class DeleteEmployeeUseCase {
  constructor(
    private readonly employeesRepository: IEmployeesRepository,
    private readonly authorizationService: IAuthorizationService,
  ) {}

  async execute({
    id,
    tenantId,
    callerPayload,
  }: DeleteEmployeeUseCaseRequest): Promise<DeleteEmployeeUseCaseResponse> {
    const employee = await this.employeesRepository.findById(id, tenantId)

    if (!employee) {
      return left(new NotFoundError())
    }

    if (
      !this.authorizationService.authorize(
        callerPayload,
        'delete',
        'User',
        employee,
      )
    ) {
      return left(new NotAllowedError())
    }

    employee.deactivate()

    await this.employeesRepository.save(employee)

    return right(null)
  }
}
