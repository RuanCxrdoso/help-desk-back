import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Technician } from '@/domain/help-desk/enterprise/entities/technician'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { User } from 'generated/prisma/client'
import { ROLE } from 'generated/prisma/enums'
import { UserUncheckedCreateInput } from 'generated/prisma/models'

export class TechnicianMapper {
  public static toPrisma(raw: Technician): UserUncheckedCreateInput {
    return {
      id: raw.id.toString(),
      tenantId: raw.tenantId.toString(),
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email.value,
      password: raw.password,
      role: ROLE.TECHNICIAN,
      createdAt: raw.createdAt,
    }
  }

  public static toDomain(raw: User): Technician {
    return Technician.create(
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
