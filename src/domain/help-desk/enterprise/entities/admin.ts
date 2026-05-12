import { ROLE } from '@/core/enums/role'
import { Optional } from '@/core/types/optional'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, UserProps } from './user'

export interface AdminProps extends UserProps {
  role: ROLE.ADMIN
}

export class Admin extends User<AdminProps> {
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
