import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  SuperAdmin,
  SuperAdminProps,
} from '@/domain/help-desk/enterprise/entities/super-admin'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { faker } from '@faker-js/faker'

export function makeSuperAdmin(
  override: Partial<SuperAdminProps> = {},
  id?: UniqueEntityID,
) {
  return SuperAdmin.create(
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: EmailValueObject.create(faker.internet.email()),
      password: faker.internet.password(),
      ...override,
    },
    id,
  )
}
