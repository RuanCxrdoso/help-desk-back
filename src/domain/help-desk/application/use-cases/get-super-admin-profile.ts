import { ROLE } from '@/core/enums/role'
import { ISuperAdminsRepository } from '../repositories/super-admins-repository'
import { Either, left, right } from '@/core/error/either'
import { NotAllowedError } from '../errors/not-allowed-error'
import { NotFoundError } from '../errors/not-found-error'
import { SuperAdmin } from '../../enterprise/entities/super-admin'

interface GetSuperAdminProfileUseCaseRequest {
  id: string
  role: string
}

type GetSuperAdminProfileUseCaseResponse = Either<
  NotAllowedError | NotFoundError,
  { superAdmin: SuperAdmin }
>

export class GetSuperAdminProfileUseCase {
  constructor(private superAdminsRepository: ISuperAdminsRepository) {}

  async execute({
    id,
    role,
  }: GetSuperAdminProfileUseCaseRequest): Promise<GetSuperAdminProfileUseCaseResponse> {
    if (role !== ROLE.SUPER_ADMIN) {
      return left(new NotAllowedError())
    }

    const superAdmin = await this.superAdminsRepository.findById(id)

    if (!superAdmin) {
      return left(new NotFoundError())
    }

    return right({ superAdmin })
  }
}
