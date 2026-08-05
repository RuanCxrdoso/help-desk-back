import { Either, left, right } from '@/core/error/either'
import { ITechniciansRepository } from '../repositories/technicians-repository'
import { NotFoundError } from '../errors/not-found-error'
import { Technician } from '../../enterprise/entities/technician'
import { Injectable } from '@nestjs/common'

interface UpdateTechnicianUseCaseRequest {
  id: string
  tenantId: string
  firstName: string
  lastName: string
  supportLevel: number
  specialties: string[]
}

type UpdateTechnicianUseCaseResponse = Either<
  NotFoundError,
  { technician: Technician }
>

@Injectable()
export class UpdateTechnicianUseCase {
  constructor(private readonly techniciansRepository: ITechniciansRepository) {}

  async execute({
    id,
    tenantId,
    firstName,
    lastName,
    supportLevel,
    specialties,
  }: UpdateTechnicianUseCaseRequest): Promise<UpdateTechnicianUseCaseResponse> {
    const technician = await this.techniciansRepository.findById(id, tenantId)

    if (!technician) return left(new NotFoundError())

    technician.firstName = firstName
    technician.lastName = lastName
    technician.supportLevel = supportLevel
    technician.specialties = specialties

    await this.techniciansRepository.save(technician)

    return right({ technician })
  }
}
