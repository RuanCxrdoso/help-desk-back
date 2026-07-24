import { Admin } from '@/domain/help-desk/enterprise/entities/admin'
import { Employee } from '@/domain/help-desk/enterprise/entities/employee'
import { SuperAdmin } from '@/domain/help-desk/enterprise/entities/super-admin'
import { Technician } from '@/domain/help-desk/enterprise/entities/technician'

export class HttpSuperAdminProfilePresenter {
  static toHttp(superAdmin: SuperAdmin) {
    const { id, firstName, lastName, email, role, createdAt, updatedAt } =
      superAdmin

    return {
      id: id.toString(),
      firstName,
      lastName,
      email: email.value,
      role,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt?.toISOString() ?? null,
    }
  }
}

export class HttpAdminProfilePresenter {
  static toHttp(admin: Admin) {
    const {
      id,
      tenantId,
      firstName,
      lastName,
      email,
      role,
      department,
      jobTitle,
      createdAt,
      updatedAt,
    } = admin

    return {
      id: id.toString(),
      tenantId,
      firstName,
      lastName,
      email: email.value,
      role,
      department,
      jobTitle,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt?.toISOString() ?? null,
    }
  }
}

export class HttpTechnicianProfilePresenter {
  static toHttp(technician: Technician) {
    const {
      id,
      tenantId,
      firstName,
      lastName,
      email,
      role,
      supportLevel,
      specialties,
      createdAt,
      updatedAt,
    } = technician

    return {
      id: id.toString(),
      tenantId,
      firstName,
      lastName,
      email: email.value,
      role,
      supportLevel,
      specialties,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt?.toISOString() ?? null,
    }
  }
}

export class HttpEmployeeProfilePresenter {
  static toHttp(employee: Employee) {
    const {
      id,
      tenantId,
      firstName,
      lastName,
      email,
      role,
      department,
      jobTitle,
      location,
      createdAt,
      updatedAt,
    } = employee

    return {
      id: id.toString(),
      tenantId,
      firstName,
      lastName,
      email: email.value,
      role,
      department,
      jobTitle,
      location,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt?.toISOString() ?? null,
    }
  }
}
