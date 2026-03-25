import { SuperAdmin } from '../../enterprise/entities/super-admin'

export abstract class ISuperAdminsRepository {
  abstract create(user: SuperAdmin): Promise<void>
  abstract findById(id: string): Promise<SuperAdmin | null>
  abstract findByEmail(email: string): Promise<SuperAdmin | null>
}
