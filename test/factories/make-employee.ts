import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  Employee,
  EmployeeProps,
} from '@/domain/help-desk/enterprise/entities/employee'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { faker } from '@faker-js/faker'

export function makeEmployee(
  override: Partial<EmployeeProps> = {},
  id?: UniqueEntityID,
) {
  return Employee.create(
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
