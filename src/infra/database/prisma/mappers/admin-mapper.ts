import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Admin } from '@/domain/help-desk/enterprise/entities/admin'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { AdminProfile, User } from 'generated/prisma/client'
import { ROLE } from 'generated/prisma/enums'
import { UserCreateInput, UserUpdateInput } from 'generated/prisma/models'

type PrismaAdminWithProfile = User & {
  adminProfile: AdminProfile | null
}

export class AdminMapper {
  public static toPrismaCreate(raw: Admin): UserCreateInput {
    return {
      id: raw.id.toString(),
      role: ROLE.ADMIN,
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email.value,
      password: raw.password,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt ?? undefined,
      deletedAt: raw.deletedAt,
      tenant: {
        connect: {
          id: raw.tenantId.toString(),
        },
      },
      adminProfile: {
        create: {
          department: raw.department,
          jobTitle: raw.jobTitle,
        },
      },
    }
  }

  public static toPrismaUpsert(raw: Admin): UserUpdateInput {
    return {
      id: raw.id.toString(),
      role: ROLE.ADMIN,
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email.value,
      password: raw.password,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt ?? undefined,
      deletedAt: raw.deletedAt,
      tenant: {
        connect: {
          id: raw.tenantId.toString(),
        },
      },
      adminProfile: {
        upsert: {
          create: {
            department: raw.department,
            jobTitle: raw.jobTitle,
          },
          update: {
            department: raw.department,
            jobTitle: raw.jobTitle,
          },
        },
      },
    }
  }

  public static toDomain(raw: PrismaAdminWithProfile): Admin {
    if (!raw.adminProfile) {
      throw new Error('Admin profile relation is not loaded.')
    }

    return Admin.create(
      {
        tenantId: new UniqueEntityID(raw.tenantId),
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: EmailValueObject.create(raw.email),
        password: raw.password,
        department: raw.adminProfile?.department,
        jobTitle: raw.adminProfile?.jobTitle,
        isActive: raw.isActive,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }
}
