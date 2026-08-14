import { Either, right, left } from '@/core/error/either'
import { ITechniciansRepository } from '../repositories/technicians-repository'
import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../errors/not-found-error'
import { TokenPayload } from '@/infra/http/auth/jwt.strategy'
import { NotAllowedError } from '../errors/not-allowed-error'
import { IAuthorizationService } from '../auth/authorization.service'
import { UserAlreadyDeletedError } from '../errors/user-already-deleted-error'

export interface DeleteTechnicianUseCaseRequest {
  id: string
  tenantId: string
  callerPayload: TokenPayload
}

type DeleteTechnicianUseCaseResponse = Either<
  NotFoundError | UserAlreadyDeletedError | NotAllowedError,
  null
>

@Injectable()
export class DeleteTechnicianUseCase {
  constructor(
    private readonly techniciansRepository: ITechniciansRepository,
    private readonly authorizationService: IAuthorizationService,
  ) {}

  async execute({
    id,
    tenantId,
    callerPayload,
  }: DeleteTechnicianUseCaseRequest): Promise<DeleteTechnicianUseCaseResponse> {
    const technician = await this.techniciansRepository.findById(id, tenantId)

    if (!technician) {
      return left(new NotFoundError())
    }

    if (!technician.isActive && technician.deletedAt) {
      return left(new UserAlreadyDeletedError())
    }

    if (
      !this.authorizationService.authorize(
        callerPayload,
        'delete',
        'User',
        technician,
      )
    ) {
      return left(new NotAllowedError())
    }

    technician.deactivate()

    await this.techniciansRepository.save(technician)

    return right(null)
  }
}
