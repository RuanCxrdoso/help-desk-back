import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ROLE } from '@/core/enums/role'
import { AuthUser } from '@/domain/help-desk/enterprise/entities/auth-user'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { User as PrismaUser } from 'generated/prisma/client'

export class AuthUserMapper {
  public static toDomain(raw: PrismaUser): AuthUser {
    return AuthUser.create(
      {
        tenantId: new UniqueEntityID(raw.tenantId),
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: EmailValueObject.create(raw.email),
        password: raw.password,
        role: raw.role as ROLE,
        isActive: raw.isActive,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }
}
