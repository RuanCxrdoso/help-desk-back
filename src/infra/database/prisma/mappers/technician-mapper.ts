import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Technician } from '@/domain/help-desk/enterprise/entities/technician'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { TechnicianProfile, User } from 'generated/prisma/client'
import { ROLE } from 'generated/prisma/enums'
import { UserCreateInput } from 'generated/prisma/models'

type PrismaTechnicianWithProfile = User & {
  technicianProfile: TechnicianProfile | null
}

export class TechnicianMapper {
  public static toPrisma(raw: Technician): UserCreateInput {
    return {
      id: raw.id.toString(),
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email.value,
      password: raw.password,
      role: ROLE.TECHNICIAN,
      createdAt: raw.createdAt,
      deletedAt: raw.deletedAt,
      tenant: {
        connect: {
          id: raw.tenantId.toString(),
        },
      },
      technicianProfile: {
        create: {
          supportLevel: raw.supportLevel,
          specialties: raw.specialties,
        },
      },
    }
  }

  public static toDomain(raw: PrismaTechnicianWithProfile): Technician {
    if (!raw.technicianProfile) {
      throw new Error('Technician profile relation is not loaded.')
    }

    return Technician.create(
      {
        tenantId: new UniqueEntityID(raw.tenantId),
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: EmailValueObject.create(raw.email),
        password: raw.password,
        supportLevel: raw.technicianProfile?.supportLevel,
        specialties: raw.technicianProfile?.specialties,
        isActive: raw.isActive,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }
}
