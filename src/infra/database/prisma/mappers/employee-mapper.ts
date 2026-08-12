import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Employee } from '@/domain/help-desk/enterprise/entities/employee'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { EmployeeProfile, User } from 'generated/prisma/client'
import { ROLE } from 'generated/prisma/enums'
import { UserCreateInput, UserUpdateInput } from 'generated/prisma/models'

type PrismaEmployeeWithProfile = User & {
  employeeProfile: EmployeeProfile | null
}

export class EmployeeMapper {
  public static toPrismaCreate(raw: Employee): UserCreateInput {
    return {
      id: raw.id.toString(),
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email.value,
      password: raw.password,
      role: ROLE.EMPLOYEE,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      deletedAt: raw.deletedAt,
      tenant: {
        connect: {
          id: raw.tenantId.toString(),
        },
      },
      employeeProfile: {
        create: {
          department: raw.department,
          jobTitle: raw.jobTitle,
          location: raw.location,
        },
      },
    }
  }

  public static toPrismaUpsert(raw: Employee): UserUpdateInput {
    return {
      id: raw.id.toString(),
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email.value,
      password: raw.password,
      role: ROLE.EMPLOYEE,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      deletedAt: raw.deletedAt,
      tenant: {
        connect: {
          id: raw.tenantId.toString(),
        },
      },
      employeeProfile: {
        upsert: {
          create: {
            department: raw.department,
            jobTitle: raw.jobTitle,
            location: raw.location,
          },
          update: {
            department: raw.department,
            jobTitle: raw.jobTitle,
            location: raw.location,
          },
        },
      },
    }
  }

  public static toDomain(raw: PrismaEmployeeWithProfile): Employee {
    if (!raw.employeeProfile) {
      throw new Error('Employee profile relation is not loaded.')
    }

    return Employee.create(
      {
        tenantId: new UniqueEntityID(raw.tenantId),
        firstName: raw.firstName,
        lastName: raw.lastName,
        email: EmailValueObject.create(raw.email),
        password: raw.password,
        department: raw.employeeProfile.department,
        jobTitle: raw.employeeProfile.jobTitle,
        location: raw.employeeProfile.location,
        isActive: raw.isActive,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }
}
