import { PaginatedResult, PaginationParams } from '@/core/types/pagination'
import { Employee } from '../../enterprise/entities/employee'
import { AuthUser } from '../../enterprise/entities/auth-user'

export abstract class IEmployeesRepository {
  abstract create(user: Employee): Promise<void>
  abstract findById(id: string, tenantId: string): Promise<Employee | null>
  abstract findMany(
    tenantId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<AuthUser>>
}
