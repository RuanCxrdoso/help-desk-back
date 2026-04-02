import { ROLE } from '@/core/enums/role'
import { EmailValueObject } from './value-objects/email-value-object'
import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface UserProps {
  firstName: string
  lastName: string
  email: EmailValueObject
  password: string
  role: ROLE
  createdAt: Date
  updatedAt?: Date | null
  tenantId: UniqueEntityID
}

export abstract class User<Props extends UserProps> extends Entity<Props> {
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

  get tenantId() {
    return this.props.tenantId.toString()
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
}
