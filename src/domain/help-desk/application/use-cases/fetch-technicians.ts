import { Injectable } from '@nestjs/common'
import { ITechniciansRepository } from '../repositories/technicians-repository'
import { Either, right } from '@/core/error/either'
import { AuthUser } from '../../enterprise/entities/auth-user'

interface FetchTechniciansUseCaseRequest {
  tenantId: string
  params: {
    q: string | null
    page: number
    perPage: number
    orderBy: string
    order: 'asc' | 'desc'
  }
}

interface FetchTechniciansRightResponse {
  technicians: AuthUser[]
  meta: {
    page: number
    perPage: number
    totalCount: number
    totalPages: number
    orderBy: string
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
    params,
  }: FetchTechniciansUseCaseRequest): Promise<FetchTechniciansUseCaseReponse> {
    const { items, page, perPage, totalCount, totalPages, orderBy, order } =
      await this.techniciansRepository.findMany(tenantId, params)

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
