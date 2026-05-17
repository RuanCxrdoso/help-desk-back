import { Subjects as PrismaSubjects } from '@casl/prisma'
import {
  User as PrismaUser,
  SuperAdmin as PrismaSuperAdmin,
  Tenant as PrismaTenant,
  Ticket as PrismaTicket,
} from 'generated/prisma/client'

export type Subjects =
  | PrismaSubjects<{
      User: PrismaUser
      SuperAdmin: PrismaSuperAdmin
      Tenant: PrismaTenant
      Ticket: PrismaTicket
    }>
  | 'all'
