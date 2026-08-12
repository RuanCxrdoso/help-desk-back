import { IAdminsRepository } from '../repositories/admins-repository'
import { Either, left, right } from '@/core/error/either'
import { NotFoundError } from '../errors/not-found-error'
import { Admin } from '../../enterprise/entities/admin'
import { Injectable } from '@nestjs/common'
import { IAuthorizationService } from '../auth/authorization.service'
import { TokenPayload } from '@/infra/http/auth/jwt.strategy'
import { NotAllowedError } from '../errors/not-allowed-error'

interface GetAdminProfileUseCaseRequest {
  id: string
  tenantId: string
  callerPayload: TokenPayload
}

type GetAdminProfileUseCaseResponse = Either<
  NotFoundError | NotAllowedError,
  { admin: Admin }
>

@Injectable()
export class GetAdminProfileUseCase {
  constructor(
    private readonly adminsRepository: IAdminsRepository,
    private readonly authorizationService: IAuthorizationService,
  ) {}

  async execute({
    id,
    tenantId,
    callerPayload,
  }: GetAdminProfileUseCaseRequest): Promise<GetAdminProfileUseCaseResponse> {
    const admin = await this.adminsRepository.findById(id, tenantId)

    if (!admin) {
      return left(new NotFoundError())
    }

    if (
      !this.authorizationService.authorize(callerPayload, 'read', 'User', admin)
    ) {
      return left(new NotAllowedError())
    }

    return right({ admin })
  }
}
