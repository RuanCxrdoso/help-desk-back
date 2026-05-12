import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Employee } from '@/domain/help-desk/enterprise/entities/employee'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { User } from 'generated/prisma/client'
import { ROLE } from 'generated/prisma/enums'
import { UserUncheckedCreateInput } from 'generated/prisma/models'

export class EmployeeMapper {
  public static toPrisma(raw: Employee): UserUncheckedCreateInput {
    return {
      id: raw.id.toString(),
      tenantId: raw.tenantId.toString(),
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email.value,
      password: raw.password,
      role: ROLE.EMPLOYEE,
      createdAt: raw.createdAt,
    }
  }

  public static toDomain(raw: User): Employee {
    return Employee.create(
      {
        tenantId: new UniqueEntityID(raw.tenantId),
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: EmailValueObject.create(raw.email),
        password: raw.password,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : undefined,
      },
      new UniqueEntityID(raw.id),
    )
  }
}
