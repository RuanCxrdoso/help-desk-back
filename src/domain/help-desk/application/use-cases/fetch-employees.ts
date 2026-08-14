import { Injectable } from '@nestjs/common'
import { IEmployeesRepository } from '../repositories/employees-repository'
import { Either, right } from '@/core/error/either'
import { AuthUser } from '../../enterprise/entities/auth-user'
import { PaginationParams } from '@/core/types/pagination'
import { ROLE } from '@/core/enums/role'

interface FetchEmployeesUseCaseRequest {
  tenantId: string
  callerRole: string
  params: PaginationParams
}

interface FetchEmployeesRightResponse {
  employees: AuthUser[]
  meta: {
    page: number
    perPage: number
    totalCount: number
    totalPages: number
    orderBy: 'firstName' | 'email' | 'createdAt'
    order: 'asc' | 'desc'
  }
}

type FetchEmployeesUseCaseReponse = Either<null, FetchEmployeesRightResponse>

@Injectable()
export class FetchEmployeesUseCase {
  constructor(private readonly employeesRepository: IEmployeesRepository) {}

  async execute({
    tenantId,
    callerRole,
    params,
  }: FetchEmployeesUseCaseRequest): Promise<FetchEmployeesUseCaseReponse> {
    let effectiveStatus = params.status ?? 'ACTIVE'

    if (callerRole === ROLE.EMPLOYEE || callerRole === ROLE.TECHNICIAN) {
      effectiveStatus = 'ACTIVE'
    }

    const { items, meta } = await this.employeesRepository.findMany(tenantId, {
      ...params,
      status: effectiveStatus,
    })

    const { page, perPage, totalCount, totalPages, orderBy, order } = meta

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
