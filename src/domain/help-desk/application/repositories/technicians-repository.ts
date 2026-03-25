import { Technician } from '../../enterprise/entities/technician'

export abstract class ITechniciansRepository {
  abstract create(user: Technician): Promise<void>
  abstract findById(id: string, tenantId: string): Promise<Technician | null>
  abstract findByEmail(
    email: string,
    tenantId: string,
  ): Promise<Technician | null>
}
