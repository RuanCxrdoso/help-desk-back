import { PaginatedResult, PaginationParams } from '@/core/types/pagination'
import { Admin } from '../../enterprise/entities/admin'
import { AuthUser } from '../../enterprise/entities/auth-user'

export abstract class IAdminsRepository {
  abstract create(user: Admin): Promise<void>
  abstract findById(id: string, tenantId: string): Promise<Admin | null>
  abstract findMany(
    tenantId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<AuthUser>>
}
