import { Injectable } from '@nestjs/common'
import { ITechniciansRepository } from '../repositories/technicians-repository'
import { Either, right } from '@/core/error/either'
import { AuthUser } from '../../enterprise/entities/auth-user'
import { PaginationParams } from '@/core/types/pagination'
import { ROLE } from '@/core/enums/role'

interface FetchTechniciansUseCaseRequest {
  tenantId: string
  callerRole: string
  params: PaginationParams
}

interface FetchTechniciansRightResponse {
  technicians: AuthUser[]
  meta: {
    page: number
    perPage: number
    totalCount: number
    totalPages: number
    orderBy: 'firstName' | 'email' | 'createdAt'
    order: 'asc' | 'desc'
  }
}

type FetchTechniciansUseCaseReponse = Either<
  null,
  FetchTechniciansRightResponse
>

@Injectable()
export class FetchTechniciansUseCase {
  constructor(private readonly techniciansRepository: ITechniciansRepository) {}

  async execute({
    tenantId,
    callerRole,
    params,
  }: FetchTechniciansUseCaseRequest): Promise<FetchTechniciansUseCaseReponse> {
    let effectiveStatus = params.status ?? 'ACTIVE'

    if (callerRole === ROLE.EMPLOYEE || callerRole === ROLE.TECHNICIAN) {
      effectiveStatus = 'ACTIVE'
    }

    const { items, meta } = await this.techniciansRepository.findMany(
      tenantId,
      {
        ...params,
        status: effectiveStatus,
      },
    )

    const { page, perPage, totalCount, totalPages, orderBy, order } = meta

    return right({
      technicians: items,
      meta: {
        page,
        perPage,
        totalCount,
        totalPages,
        orderBy,
        order,
      },
    })
  }
}
