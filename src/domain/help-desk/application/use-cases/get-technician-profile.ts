import { ROLE } from '@/core/enums/role'
import { ITechniciansRepository } from '../repositories/technicians-repository'
import { Either, left, right } from '@/core/error/either'
import { NotAllowedError } from '../errors/not-allowed-error'
import { NotFoundError } from '../errors/not-found-error'
import { Technician } from '../../enterprise/entities/technician'

interface GetTechnicianProfileUseCaseRequest {
  id: string
  tenantId: string
  role: string
}

type GetTechnicianProfileUseCaseResponse = Either<
  NotAllowedError | NotFoundError,
  { technician: Technician }
>

export class GetTechnicianProfileUseCase {
  constructor(private techniciansRepository: ITechniciansRepository) {}

  async execute({
    id,
    tenantId,
    role,
  }: GetTechnicianProfileUseCaseRequest): Promise<GetTechnicianProfileUseCaseResponse> {
    if (role !== ROLE.TECHNICIAN) {
      return left(new NotAllowedError())
    }

    const technician = await this.techniciansRepository.findById(id, tenantId)

    if (!technician) {
      return left(new NotFoundError())
    }

    return right({ technician })
  }
}
