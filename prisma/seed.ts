import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'
import {
  PrismaClient,
  ROLE,
  TENANT_STATUS,
  TICKET_PRIORITY,
  TICKET_STATUS,
} from 'generated/prisma/client'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})
async function main() {
  const passwordHash = await hash('password', 8)

  console.log('Cleaning database...')
  await prisma.ticket.deleteMany()
  await prisma.adminProfile.deleteMany()
  await prisma.technicianProfile.deleteMany()
  await prisma.employeeProfile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()
  await prisma.superAdmin.deleteMany()

  console.log('Seeding Super Admin...')
  await prisma.superAdmin.create({
    data: {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@email.com',
      password: passwordHash,
    },
  })

  console.log('Seeding CANCELLED Tenant...')
  const cancelledTenant = await prisma.tenant.create({
    data: {
      name: 'Cancelled Corp',
      slug: 'cancelled-corp',
      status: TENANT_STATUS.CANCELLED,
    },
  })

  await prisma.user.create({
    data: {
      tenantId: cancelledTenant.id,
      email: 'admin@cancelled.com',
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'Cancelled',
      role: ROLE.ADMIN,
      isActive: true,
      adminProfile: {
        create: {
          department: 'Management',
          jobTitle: 'Administrator',
        },
      },
    },
  })

  console.log('Seeding SUSPENDED Tenant...')
  const suspendedTenant = await prisma.tenant.create({
    data: {
      name: 'Suspended Corp',
      slug: 'suspended-corp',
      status: TENANT_STATUS.SUSPENDED,
    },
  })

  await prisma.user.create({
    data: {
      tenantId: suspendedTenant.id,
      email: 'admin@suspended.com',
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'Suspended',
      role: ROLE.ADMIN,
      isActive: true,
      adminProfile: {
        create: {
          department: 'Management',
          jobTitle: 'Administrator',
        },
      },
    },
  })

  console.log('Seeding ACTIVE Tenant...')
  const activeTenant = await prisma.tenant.create({
    data: {
      name: 'Active Corp',
      slug: 'active-corp',
      status: TENANT_STATUS.ACTIVE,
    },
  })

  await prisma.user.create({
    data: {
      tenantId: activeTenant.id,
      email: 'admin@active.com',
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'Active',
      role: ROLE.ADMIN,
      isActive: true,
      adminProfile: {
        create: {
          department: 'IT',
          jobTitle: 'IT Director',
        },
      },
    },
  })

  await prisma.user.create({
    data: {
      tenantId: activeTenant.id,
      email: 'admin-inactive@active.com',
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'Inactive',
      role: ROLE.ADMIN,
      isActive: false,
      deletedAt: new Date(),
      adminProfile: {
        create: {
          department: 'IT',
          jobTitle: 'Former IT Director',
        },
      },
    },
  })

  const activeTech = await prisma.user.create({
    data: {
      tenantId: activeTenant.id,
      email: 'tech@active.com',
      password: passwordHash,
      firstName: 'Tech',
      lastName: 'Active',
      role: ROLE.TECHNICIAN,
      isActive: true,
      technicianProfile: {
        create: {
          supportLevel: 2,
          specialties: ['Networking', 'Hardware'],
        },
      },
    },
  })

  await prisma.user.create({
    data: {
      tenantId: activeTenant.id,
      email: 'tech-inactive@active.com',
      password: passwordHash,
      firstName: 'Tech',
      lastName: 'Inactive',
      role: ROLE.TECHNICIAN,
      isActive: false,
      deletedAt: new Date(),
      technicianProfile: {
        create: {
          supportLevel: 1,
          specialties: ['Printers'],
        },
      },
    },
  })

  const activeEmp1 = await prisma.user.create({
    data: {
      tenantId: activeTenant.id,
      email: 'emp1@active.com',
      password: passwordHash,
      firstName: 'Employee 1',
      lastName: 'Active',
      role: ROLE.EMPLOYEE,
      isActive: true,
      employeeProfile: {
        create: {
          department: 'Sales',
          jobTitle: 'Sales Representative',
          location: 'Floor 1',
        },
      },
    },
  })

  const activeEmp2 = await prisma.user.create({
    data: {
      tenantId: activeTenant.id,
      email: 'emp2@active.com',
      password: passwordHash,
      firstName: 'Employee 2',
      lastName: 'Active',
      role: ROLE.EMPLOYEE,
      isActive: true,
      employeeProfile: {
        create: {
          department: 'Marketing',
          jobTitle: 'Marketing Analyst',
          location: 'Floor 2',
        },
      },
    },
  })

  await prisma.user.create({
    data: {
      tenantId: activeTenant.id,
      email: 'emp-inactive@active.com',
      password: passwordHash,
      firstName: 'Employee',
      lastName: 'Inactive',
      role: ROLE.EMPLOYEE,
      isActive: false,
      deletedAt: new Date(),
      employeeProfile: {
        create: {
          department: 'HR',
          jobTitle: 'Recruiter',
          location: 'Floor 3',
        },
      },
    },
  })

  console.log('Seeding TICKETS...')
  await prisma.ticket.createMany({
    data: [
      {
        tenantId: activeTenant.id,
        title: 'Cannot access email',
        description: 'My outlook is not opening.',
        status: TICKET_STATUS.OPEN,
        priority: TICKET_PRIORITY.HIGH,
        employeeId: activeEmp1.id,
      },
      {
        tenantId: activeTenant.id,
        title: 'Need a new mouse',
        description: 'The scroll wheel is broken.',
        status: TICKET_STATUS.IN_PROGRESS,
        priority: TICKET_PRIORITY.LOW,
        employeeId: activeEmp2.id,
        technicianId: activeTech.id,
      },
      {
        tenantId: activeTenant.id,
        title: 'Printer is out of ink',
        description: 'Floor 1 printer needs black ink.',
        status: TICKET_STATUS.RESOLVED,
        priority: TICKET_PRIORITY.MEDIUM,
        employeeId: activeEmp1.id,
        technicianId: activeTech.id,
      },
      {
        tenantId: activeTenant.id,
        title: 'Projector not working',
        description: 'Meeting room projector has no signal.',
        status: TICKET_STATUS.CLOSED,
        priority: TICKET_PRIORITY.HIGH,
        employeeId: activeEmp2.id,
        technicianId: activeTech.id,
      },
      {
        tenantId: activeTenant.id,
        title: 'Requesting software license',
        description: 'Need access to Figma.',
        status: TICKET_STATUS.CANCELLED,
        priority: TICKET_PRIORITY.LOW,
        employeeId: activeEmp1.id,
      },
    ],
  })

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
