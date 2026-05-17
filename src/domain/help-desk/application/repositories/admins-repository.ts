import { Admin } from '../../enterprise/entities/admin'

export abstract class IAdminsRepository {
  abstract create(user: Admin): Promise<void>
  abstract findById(id: string, tenantId: string): Promise<Admin | null>
}
