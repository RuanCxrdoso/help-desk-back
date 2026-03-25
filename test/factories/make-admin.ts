import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Admin, AdminProps } from '@/domain/help-desk/enterprise/entities/admin'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { faker } from '@faker-js/faker'

export function makeAdmin(
  override: Partial<AdminProps> = {},
  id?: UniqueEntityID,
) {
  return Admin.create(
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: EmailValueObject.create(faker.internet.email()),
      password: faker.internet.password(),
      tenantId: new UniqueEntityID(),
      ...override,
    },
    id,
  )
}
