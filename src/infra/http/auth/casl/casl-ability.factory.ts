import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  MongoAbility,
} from '@casl/ability'
import { Action } from './action'
import { Subjects } from './subjects'
import { Injectable } from '@nestjs/common'
import { TokenPayload } from '../jwt.strategy'
import { ROLE } from '@/core/enums/role'
import { TICKET_STATUS } from 'generated/prisma/enums'

export type AppAbility = MongoAbility<[Action, Subjects]>

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: TokenPayload) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    )

    const {
      Manage,
      Create,
      Read,
      Update,
      Delete,
      Assign,
      Unassign,
      Cancel,
      Close,
      Reopen,
      Resolve,
    } = Action

    if (user.role === ROLE.SUPER_ADMIN) {
      can(Manage, 'all')
      cannot(Delete, 'SuperAdmin', { id: user.sub })
    }

    if (user.role === ROLE.ADMIN) {
      can(Create, 'User', { tenantId: user.tenantId })
      can(Read, 'User', { tenantId: user.tenantId })
      can(Update, 'User', { tenantId: user.tenantId, id: user.sub })
      can(Update, 'User', {
        tenantId: user.tenantId,
        role: { $in: [ROLE.EMPLOYEE, ROLE.TECHNICIAN] },
      })
      can(Delete, 'User', {
        tenantId: user.tenantId,
        role: { $in: [ROLE.EMPLOYEE, ROLE.TECHNICIAN] },
      })

      can(Read, 'Tenant', { id: user.tenantId })
      can(Update, 'Tenant', { id: user.tenantId })

      can(Manage, 'Ticket', { tenantId: user.tenantId })

      cannot(Delete, 'User', { tenantId: user.tenantId, id: user.sub })
    }

    if (user.role === ROLE.TECHNICIAN) {
      can(Read, 'User', { tenantId: user.tenantId })
      can(Update, 'User', { tenantId: user.tenantId, id: user.sub })

      can(Read, 'Tenant', { id: user.tenantId })

      can(Update, 'Ticket', {
        tenantId: user.tenantId,
        technicianId: user.sub,
        status: {
          $nin: [
            TICKET_STATUS.CLOSED,
            TICKET_STATUS.CANCELLED,
            TICKET_STATUS.RESOLVED,
          ],
        },
      })
      can(Update, 'Ticket', {
        tenantId: user.tenantId,
        technicianId: null,
        status: {
          $nin: [
            TICKET_STATUS.CLOSED,
            TICKET_STATUS.CANCELLED,
            TICKET_STATUS.RESOLVED,
          ],
        },
      })

      can(Read, 'Ticket', { tenantId: user.tenantId })
      can(Assign, 'Ticket', { tenantId: user.tenantId, technicianId: null })

      can([Unassign, Resolve, Cancel, Reopen], 'Ticket', {
        tenantId: user.tenantId,
        technicianId: user.sub,
      })
    }

    if (user.role === ROLE.EMPLOYEE) {
      can(Read, 'User', { tenantId: user.tenantId })
      can(Update, 'User', { tenantId: user.tenantId, id: user.sub })

      can(Read, 'Tenant', { id: user.tenantId })

      can(Create, 'Ticket')
      can(Read, 'Ticket', { tenantId: user.tenantId, employeeId: user.sub })
      can(Update, 'Ticket', {
        tenantId: user.tenantId,
        employeeId: user.sub,
        status: {
          $nin: [
            TICKET_STATUS.CLOSED,
            TICKET_STATUS.CANCELLED,
            TICKET_STATUS.RESOLVED,
          ],
        },
      })

      can([Cancel, Close, Reopen], 'Ticket', {
        tenantId: user.tenantId,
        employeeId: user.sub,
      })
    }

    return build({
      detectSubjectType: (item: any) => {
        if (item && item.__caslSubjectType__) {
          return item.__caslSubjectType__ as ExtractSubjectType<Subjects>
        }
        return item.constructor as ExtractSubjectType<Subjects>
      },
    })
  }
}
