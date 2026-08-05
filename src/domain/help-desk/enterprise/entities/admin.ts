import { ROLE } from '@/core/enums/role'
import { Optional } from '@/core/types/optional'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, UserProps } from './user'

export interface AdminProps extends UserProps {
  role: ROLE.ADMIN
  department: string
  jobTitle: string
}

export class Admin extends User<AdminProps> {
  get role() {
    return this.props.role
  }

  get department() {
    return this.props.department
  }

  get jobTitle() {
    return this.props.jobTitle
  }

  set department(value: string) {
    this.props.department = value
  }

  set jobTitle(value: string) {
    this.props.jobTitle = value
  }

  static create(
    props: Optional<AdminProps, 'createdAt' | 'updatedAt' | 'role'>,
    id?: UniqueEntityID,
  ) {
    const admin = new Admin(
      {
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
        role: ROLE.ADMIN,
        ...props,
      },
      id ?? new UniqueEntityID(),
    )

    return admin
  }
}
