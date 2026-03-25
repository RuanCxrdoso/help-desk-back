import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  Technician,
  TechnicianProps,
} from '@/domain/help-desk/enterprise/entities/technician'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { faker } from '@faker-js/faker'

export function makeTechnician(
  override: Partial<TechnicianProps> = {},
  id?: UniqueEntityID,
) {
  return Technician.create(
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
