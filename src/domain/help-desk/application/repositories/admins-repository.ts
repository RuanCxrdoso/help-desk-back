import { Admin } from '../../enterprise/entities/admin'

export abstract class IAdminsRepository {
  abstract create(user: Admin): Promise<void>
  abstract findById(id: string): Promise<Admin | null>
  abstract findByEmail(email: string): Promise<Admin | null>
}
