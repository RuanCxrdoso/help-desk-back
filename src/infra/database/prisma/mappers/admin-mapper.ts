import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Admin } from '@/domain/help-desk/enterprise/entities/admin'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { User } from 'generated/prisma/client'
import { ROLE } from 'generated/prisma/enums'
import { UserUncheckedCreateInput } from 'generated/prisma/models'

export class AdminMapper {
  public static toPrisma(raw: Admin): UserUncheckedCreateInput {
    return {
      id: raw.id.toString(),
      tenantId: raw.tenantId.toString(),
      role: ROLE.ADMIN,
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email.value,
      password: raw.password,
      createdAt: raw.createdAt,
    }
  }

  public static toDomain(raw: User): Admin {
    return Admin.create(
      {
        tenantId: new UniqueEntityID(raw.tenantId),
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: EmailValueObject.create(raw.email),
        password: raw.password,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }
}
