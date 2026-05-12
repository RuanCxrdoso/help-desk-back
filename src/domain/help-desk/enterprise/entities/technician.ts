import { ROLE } from '@/core/enums/role'
import { Optional } from '@/core/types/optional'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, UserProps } from './user'

export interface TechnicianProps extends UserProps {
  role: ROLE.TECHNICIAN
}

export class Technician extends User<TechnicianProps> {
  static create(
    props: Optional<TechnicianProps, 'createdAt' | 'updatedAt' | 'role'>,
    id?: UniqueEntityID,
  ) {
    const technician = new Technician(
      {
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
        role: ROLE.TECHNICIAN,
        ...props,
      },
      id ?? new UniqueEntityID(),
    )

    return technician
  }
}
