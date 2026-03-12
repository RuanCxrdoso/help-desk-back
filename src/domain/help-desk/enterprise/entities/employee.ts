import { Entity } from '@/core/entities/entity'
import { ROLE } from '@/core/enums/role'
import { EmailValueObject } from './value-objects/email-value-object'
import { Optional } from '@/core/types/optional'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface EmployeeProps {
  firstName: string
  lastName: string
  email: EmailValueObject
  password: string
  role: ROLE.EMPLOYEE
  createdAt: Date
  updatedAt?: Date | null
}

export class Employee extends Entity<EmployeeProps> {
  get firstName() {
    return this.props.firstName
  }

  get lastName() {
    return this.props.lastName
  }

  get email() {
    return this.props.email
  }

  get password() {
    return this.props.password
  }

  get role() {
    return this.props.role
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  set firstName(value: string) {
    this.props.firstName = value

    this.touch()
  }

  set lastName(value: string) {
    this.props.lastName = value

    this.touch()
  }

  set email(value: EmailValueObject) {
    this.props.email = value

    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<EmployeeProps, 'createdAt' | 'updatedAt' | 'role'>,
    id?: UniqueEntityID,
  ) {
    const employee = new Employee(
      {
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
        role: ROLE.EMPLOYEE,
        ...props,
      },
      id ?? new UniqueEntityID(),
    )

    return employee
  }
}
