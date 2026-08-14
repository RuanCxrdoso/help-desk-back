import { ITechniciansRepository } from '../repositories/technicians-repository'
import { Either, left, right } from '@/core/error/either'
import { NotFoundError } from '../errors/not-found-error'
import { Technician } from '../../enterprise/entities/technician'
import { Injectable } from '@nestjs/common'
import { TokenPayload } from '@/infra/http/auth/jwt.strategy'
import { NotAllowedError } from '../errors/not-allowed-error'
import { IAuthorizationService } from '../auth/authorization.service'

interface GetTechnicianProfileUseCaseRequest {
  id: string
  tenantId: string
  callerPayload: TokenPayload
}

type GetTechnicianProfileUseCaseResponse = Either<
  NotFoundError | NotAllowedError,
  { technician: Technician }
>

@Injectable()
export class GetTechnicianProfileUseCase {
  constructor(
    private readonly techniciansRepository: ITechniciansRepository,
    private readonly authorizationService: IAuthorizationService,
  ) {}

  async execute({
    id,
    tenantId,
    callerPayload,
  }: GetTechnicianProfileUseCaseRequest): Promise<GetTechnicianProfileUseCaseResponse> {
    const technician = await this.techniciansRepository.findById(id, tenantId)

    if (!technician) {
      return left(new NotFoundError())
    }

    if (
      !this.authorizationService.authorize(
        callerPayload,
        'read',
        'User',
        technician,
      )
    ) {
      return left(new NotAllowedError())
    }

    return right({ technician })
  }
}
