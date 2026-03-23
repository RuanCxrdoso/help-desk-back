import { Employee } from '../../enterprise/entities/employee'

export abstract class IEmployeesRepository {
  abstract create(user: Employee): Promise<void>
  abstract findById(id: string, tenantId: string): Promise<Employee | null>
  abstract findByEmail(
    email: string,
    tenantId: string,
  ): Promise<Employee | null>
}
