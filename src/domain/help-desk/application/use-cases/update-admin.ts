import { Either, right, left } from '@/core/error/either'
import { IAdminsRepository } from '../repositories/admins-repository'
import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../errors/not-found-error'
import { Admin } from '../../enterprise/entities/admin'
import { IAuthorizationService } from '../auth/authorization.service'
import { NotAllowedError } from '../errors/not-allowed-error'
import { TokenPayload } from '@/infra/http/auth/jwt.strategy'

export interface UpdateAdminUseCaseRequest {
  id: string
  tenantId?: string
  callerPayload: TokenPayload
  firstName: string
  lastName: string
  department: string
  jobTitle: string
}

type UpdateAdminUseCaseResponse = Either<
  NotFoundError | NotAllowedError,
  { admin: Admin }
>

@Injectable()
export class UpdateAdminUseCase {
  constructor(
    private readonly adminsRepository: IAdminsRepository,
    private readonly authorizationService: IAuthorizationService,
  ) {}

  async execute({
    id,
    tenantId,
    callerPayload,
    firstName,
    lastName,
    department,
    jobTitle,
  }: UpdateAdminUseCaseRequest): Promise<UpdateAdminUseCaseResponse> {
    const admin = await this.adminsRepository.findById(id, tenantId)

    if (!admin) return left(new NotFoundError())

    if (
      !this.authorizationService.authorize(
        callerPayload,
        'update',
        'User',
        admin,
      )
    ) {
      return left(new NotAllowedError())
    }

    admin.firstName = firstName
    admin.lastName = lastName
    admin.department = department
    admin.jobTitle = jobTitle

    await this.adminsRepository.save(admin)

    return right({ admin })
  }
}
