import { Either, right, left } from '@/core/error/either'
import { ITechniciansRepository } from '../repositories/technicians-repository'
import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../errors/not-found-error'

export interface DeleteTechnicianUseCaseRequest {
  id: string
  tenantId: string
}

type DeleteTechnicianUseCaseResponse = Either<NotFoundError, null>

@Injectable()
export class DeleteTechnicianUseCase {
  constructor(private readonly techniciansRepository: ITechniciansRepository) {}

  async execute({
    id,
    tenantId,
  }: DeleteTechnicianUseCaseRequest): Promise<DeleteTechnicianUseCaseResponse> {
    const technician = await this.techniciansRepository.findById(id, tenantId)

    if (!technician) {
      return left(new NotFoundError())
    }

    technician.deactivate()

    await this.techniciansRepository.save(technician)

    return right(null)
  }
}
