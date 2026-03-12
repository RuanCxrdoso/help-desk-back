import { Admin } from '../../enterprise/entities/admin'
import { Employee } from '../../enterprise/entities/employee'
import { Technician } from '../../enterprise/entities/technician'

export abstract class IUsersRepository {
  abstract create(user: Admin | Technician | Employee): Promise<void>
  abstract findById(id: string): Promise<Admin | Technician | Employee | null>
  abstract findByEmail(
    email: string,
  ): Promise<Admin | Technician | Employee | null>
}
