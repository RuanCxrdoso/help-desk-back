import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { SuperAdmin as SuperAdminDomain } from '@/domain/help-desk/enterprise/entities/super-admin'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { SuperAdmin } from 'generated/prisma/client'
import { SuperAdminUncheckedCreateInput } from 'generated/prisma/models'

export class SuperAdminMapper {
  public static toPrisma(
    raw: SuperAdminDomain,
  ): SuperAdminUncheckedCreateInput {
    return {
      id: raw.id.toString(),
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email.value,
      password: raw.password,
      createdAt: raw.createdAt,
    }
  }

  public static toDomain(raw: SuperAdmin): SuperAdminDomain {
    return SuperAdminDomain.create(
      {
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
