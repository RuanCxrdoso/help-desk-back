import { ITechniciansRepository } from '../repositories/technicians-repository'
import { Either, left, right } from '@/core/error/either'
import { NotFoundError } from '../errors/not-found-error'
import { Technician } from '../../enterprise/entities/technician'
import { Injectable } from '@nestjs/common'

interface GetTechnicianProfileUseCaseRequest {
  id: string
  tenantId: string
}

type GetTechnicianProfileUseCaseResponse = Either<
  NotFoundError,
  { technician: Technician }
>

@Injectable()
export class GetTechnicianProfileUseCase {
  constructor(private techniciansRepository: ITechniciansRepository) {}

  async execute({
    id,
    tenantId,
  }: GetTechnicianProfileUseCaseRequest): Promise<GetTechnicianProfileUseCaseResponse> {
    const technician = await this.techniciansRepository.findById(id, tenantId)

    if (!technician) {
      return left(new NotFoundError())
    }

    return right({ technician })
  }
}
