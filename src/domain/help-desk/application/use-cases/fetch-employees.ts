import { Injectable } from '@nestjs/common'
import { IEmployeesRepository } from '../repositories/employees-repository'
import { Either, right } from '@/core/error/either'
import { AuthUser } from '../../enterprise/entities/auth-user'

interface FetchEmployeesUseCaseRequest {
  tenantId: string
  params: {
    q?: string | null
    page: number
    perPage: number
    orderBy:  'firstName' | 'email' | 'createdAt'
    order: 'asc' | 'desc'
  }
}

interface FetchEmployeesRightResponse {
  employees: AuthUser[]
  meta: {
    page: number
    perPage: number
    totalCount: number
    totalPages: number
    orderBy:  'firstName' | 'email' | 'createdAt'
    order: 'asc' | 'desc'
  }
}

type FetchEmployeesUseCaseReponse = Either<null, FetchEmployeesRightResponse>

@Injectable()
export class FetchEmployeesUseCase {
  constructor(private readonly employeesRepository: IEmployeesRepository) {}

  async execute({
    tenantId,
    params,
  }: FetchEmployeesUseCaseRequest): Promise<FetchEmployeesUseCaseReponse> {
    const { items, page, perPage, totalCount, totalPages, orderBy, order } =
      await this.employeesRepository.findMany(tenantId, params)

    return right({
      employees: items,
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
