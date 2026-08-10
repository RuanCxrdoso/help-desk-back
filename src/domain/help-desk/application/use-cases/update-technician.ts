import { Either, left, right } from '@/core/error/either'
import { ITechniciansRepository } from '../repositories/technicians-repository'
import { NotFoundError } from '../errors/not-found-error'
import { Technician } from '../../enterprise/entities/technician'
import { Injectable } from '@nestjs/common'
import { TokenPayload } from '@/infra/http/auth/jwt.strategy'
import { IAuthorizationService } from '../auth/authorization.service'
import { NotAllowedError } from '../errors/not-allowed-error'

interface UpdateTechnicianUseCaseRequest {
  id: string
  tenantId?: string
  callerPayload: TokenPayload
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
  constructor(
    private readonly techniciansRepository: ITechniciansRepository,
    private readonly authorizationService: IAuthorizationService,
  ) {}

  async execute({
    id,
    tenantId,
    callerPayload,
    firstName,
    lastName,
    supportLevel,
    specialties,
  }: UpdateTechnicianUseCaseRequest): Promise<UpdateTechnicianUseCaseResponse> {
    const technician = await this.techniciansRepository.findById(id, tenantId)

    if (!technician) return left(new NotFoundError())

    if (
      !this.authorizationService.authorize(
        callerPayload,
        'update',
        'User',
        technician,
      )
    ) {
      return left(new NotAllowedError())
    }

    technician.firstName = firstName
    technician.lastName = lastName
    technician.supportLevel = supportLevel
    technician.specialties = specialties

    await this.techniciansRepository.save(technician) // TODO: IMPLEMENTS SAVE METHOD IN PRISMA REPOSITORY (ADMINS, TECHNICIANS AND EMPLOYEES)

    return right({ technician })
  }
}
