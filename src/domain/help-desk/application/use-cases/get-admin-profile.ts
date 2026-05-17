import { ROLE } from '@/core/enums/role'
import { IAdminsRepository } from '../repositories/admins-repository'
import { Either, left, right } from '@/core/error/either'
import { NotAllowedError } from '../errors/not-allowed-error'
import { NotFoundError } from '../errors/not-found-error'
import { Admin } from '../../enterprise/entities/admin'

interface GetAdminProfileUseCaseRequest {
  id: string
  tenantId: string
  role: string
}

type GetAdminProfileUseCaseResponse = Either<
  NotAllowedError | NotFoundError,
  { admin: Admin }
>

export class GetAdminProfileUseCase {
  constructor(private adminsRepository: IAdminsRepository) {}

  async execute({
    id,
    tenantId,
    role,
  }: GetAdminProfileUseCaseRequest): Promise<GetAdminProfileUseCaseResponse> {
    if (role !== ROLE.ADMIN) {
      return left(new NotAllowedError())
    }

    const admin = await this.adminsRepository.findById(id, tenantId)

    if (!admin) {
      return left(new NotFoundError())
    }

    return right({ admin })
  }
}
