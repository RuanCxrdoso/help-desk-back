import { ROLE } from '@/core/enums/role'
import { Optional } from '@/core/types/optional'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, UserProps } from './user'

export interface TechnicianProps extends UserProps {
  role: ROLE.TECHNICIAN
  supportLevel: number
  specialties: string[]
}

export class Technician extends User<TechnicianProps> {
  get supportLevel() {
    return this.props.supportLevel
  }

  get specialties() {
    return this.props.specialties
  }

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
