import { Injectable } from '@nestjs/common'
import { IAdminsRepository } from '../repositories/admins-repository'
import { Either, right } from '@/core/error/either'
import { AuthUser } from '../../enterprise/entities/auth-user'
import { PaginationParams } from '@/core/types/pagination'

interface FetchAdminsUseCaseRequest {
  tenantId: string
  params: PaginationParams
}

interface FetchAdminsRightResponse {
  admins: AuthUser[]
  meta: {
    page: number
    perPage: number
    totalCount: number
    totalPages: number
    orderBy: 'firstName' | 'email' | 'createdAt'
    order: 'asc' | 'desc'
  }
}

type FetchAdminsUseCaseReponse = Either<null, FetchAdminsRightResponse>

@Injectable()
export class FetchAdminsUseCase {
  constructor(private readonly adminsRepository: IAdminsRepository) {}

  async execute({
    tenantId,
    params,
  }: FetchAdminsUseCaseRequest): Promise<FetchAdminsUseCaseReponse> {
    const { items, page, perPage, totalCount, totalPages, orderBy, order } =
      await this.adminsRepository.findMany(tenantId, params)

    return right({
      admins: items,
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
