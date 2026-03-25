import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  Tenant,
  TenantProps,
} from '@/domain/help-desk/enterprise/entities/tenant'
import { faker } from '@faker-js/faker'

export function makeTenant(
  override: Partial<TenantProps> = {},
  id?: UniqueEntityID,
) {
  return Tenant.create(
    {
      name: faker.company.name(),
      ...override,
    },
    id,
  )
}
