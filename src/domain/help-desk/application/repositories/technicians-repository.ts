import { Technician } from '../../enterprise/entities/technician'

export abstract class ITechniciansRepository {
  abstract create(user: Technician): Promise<void>
  abstract findById(id: string): Promise<Technician | null>
  abstract findByEmail(email: string): Promise<Technician | null>
}
