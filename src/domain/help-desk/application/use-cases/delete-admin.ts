import { Either, right, left } from '@/core/error/either'
import { IAdminsRepository } from '../repositories/admins-repository'
import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../errors/not-found-error'
import { IAuthorizationService } from '../auth/authorization.service'
import { TokenPayload } from '@/infra/http/auth/jwt.strategy'
import { NotAllowedError } from '../errors/not-allowed-error'
import { UserAlreadyDeletedError } from '../errors/user-already-deleted-error'

export interface DeleteAdminUseCaseRequest {
  id: string
  tenantId: string
  callerPayload: TokenPayload
}

type DeleteAdminUseCaseResponse = Either<
  NotFoundError | UserAlreadyDeletedError | NotAllowedError,
  null
>

@Injectable()
export class DeleteAdminUseCase {
  constructor(
    private readonly adminsRepository: IAdminsRepository,
    private readonly authorizationService: IAuthorizationService,
  ) {}

  async execute({
    id,
    tenantId,
    callerPayload,
  }: DeleteAdminUseCaseRequest): Promise<DeleteAdminUseCaseResponse> {
    const admin = await this.adminsRepository.findById(id, tenantId)

    if (!admin) {
      return left(new NotFoundError())
    }

    if (!admin.isActive && admin.deletedAt) {
      return left(new UserAlreadyDeletedError())
    }

    if (
      !this.authorizationService.authorize(
        callerPayload,
        'delete',
        'User',
        admin,
      )
    ) {
      return left(new NotAllowedError())
    }

    admin.deactivate()

    await this.adminsRepository.save(admin)

    return right(null)
  }
}
