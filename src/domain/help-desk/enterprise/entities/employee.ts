import { ROLE } from '@/core/enums/role'
import { Optional } from '@/core/types/optional'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, UserProps } from './user'

export interface EmployeeProps extends UserProps {
  role: ROLE.EMPLOYEE
  department: string
  jobTitle: string
  location: string
}

export class Employee extends User<EmployeeProps> {
  get department() {
    return this.props.department
  }

  get jobTitle() {
    return this.props.jobTitle
  }

  get location() {
    return this.props.location
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
