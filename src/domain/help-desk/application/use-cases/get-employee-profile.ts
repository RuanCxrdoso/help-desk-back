import { IEmployeesRepository } from '../repositories/employees-repository'
import { Either, left, right } from '@/core/error/either'
import { NotFoundError } from '../errors/not-found-error'
import { Employee } from '../../enterprise/entities/employee'
import { Injectable } from '@nestjs/common'
import { TokenPayload } from '@/infra/http/auth/jwt.strategy'
import { NotAllowedError } from '../errors/not-allowed-error'
import { IAuthorizationService } from '../auth/authorization.service'

interface GetEmployeeProfileUseCaseRequest {
  id: string
  tenantId: string
  callerPayload: TokenPayload
}

type GetEmployeeProfileUseCaseResponse = Either<
  NotFoundError,
  { employee: Employee }
>

@Injectable()
export class GetEmployeeProfileUseCase {
  constructor(
    private readonly employeesRepository: IEmployeesRepository,
    private readonly authorizationService: IAuthorizationService,
  ) {}

  async execute({
    id,
    tenantId,
    callerPayload,
  }: GetEmployeeProfileUseCaseRequest): Promise<GetEmployeeProfileUseCaseResponse> {
    const employee = await this.employeesRepository.findById(id, tenantId)

    if (!employee) {
      return left(new NotFoundError())
    }

    if (
      !this.authorizationService.authorize(
        callerPayload,
        'read',
        'User',
        employee,
      )
    ) {
      return left(new NotAllowedError())
    }

    return right({ employee })
  }
}
