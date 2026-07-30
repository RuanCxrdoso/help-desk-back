import { PaginatedResult, PaginationParams } from '@/core/types/pagination'
import { Technician } from '../../enterprise/entities/technician'
import { AuthUser } from '../../enterprise/entities/auth-user'

export abstract class ITechniciansRepository {
  abstract create(user: Technician): Promise<void>
  abstract findById(id: string, tenantId: string): Promise<Technician | null>
  abstract findMany(
    tenantId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<AuthUser>>
}
