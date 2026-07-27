import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Tenant as TenantDomain } from '@/domain/help-desk/enterprise/entities/tenant'
import { Slug } from '@/domain/help-desk/enterprise/entities/value-objects/slug-value-object'
import { Tenant } from 'generated/prisma/client'
import { TenantUncheckedCreateInput } from 'generated/prisma/models'

export class TenantMapper {
  public static toPrisma(raw: TenantDomain): TenantUncheckedCreateInput {
    return {
      id: raw.id.toString(),
      slug: raw.slug.toString(),
      name: raw.name,
      status: raw.status,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt ?? undefined,
      deletedAt: raw.deletedAt,
    }
  }

  public static toDomain(raw: Tenant): TenantDomain {
    return TenantDomain.create(
      {
        slug: Slug.createFromText(raw.slug),
        name: raw.name,
        status: raw.status,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }
}
