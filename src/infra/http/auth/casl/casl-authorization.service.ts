import { Injectable } from '@nestjs/common'
import {
  DomainAction,
  DomainSubject,
  IAuthorizationService,
} from '@/domain/help-desk/application/auth/authorization.service'
import { TokenPayload } from '../jwt.strategy'
import { CaslAbilityFactory } from './casl-ability.factory'
import { Action } from './action'
import { subject } from '@casl/ability'

@Injectable()
export class CaslAuthorizationService implements IAuthorizationService {
  constructor(private readonly caslAbilityFactory: CaslAbilityFactory) {}

  private mapAction(action: DomainAction): Action {
    const actionMap: Record<DomainAction, Action> = {
      manage: Action.Manage,
      create: Action.Create,
      read: Action.Read,
      update: Action.Update,
      delete: Action.Delete,
      assign: Action.Assign,
      unassign: Action.Unassign,
      cancel: Action.Cancel,
      close: Action.Close,
      reopen: Action.Reopen,
      resolve: Action.Resolve,
    }

    return actionMap[action]
  }

  private mapEntityToCaslSubject(
    subjectName: DomainSubject,
    entity: any,
  ): Record<string, unknown> {
    if (!entity) return {}

    const mapped: Record<string, unknown> = {}

    if (entity.id) mapped.id = entity.id.toString()
    if (entity.tenantId) mapped.tenantId = entity.tenantId.toString()

    if (subjectName === 'User') {
      mapped.role = entity.role
    } else if (subjectName === 'Ticket') {
      mapped.technicianId = entity.technicianId
        ? entity.technicianId.toString()
        : null
      mapped.employeeId = entity.employeeId
        ? entity.employeeId.toString()
        : null
      mapped.status = entity.status
    }

    return mapped
  }

  authorize(
    callerPayload: TokenPayload,
    action: DomainAction,
    subjectName: DomainSubject,
    entity?: any,
  ): boolean {
    const ability = this.caslAbilityFactory.createForUser(callerPayload)
    const caslAction = this.mapAction(action)

    if (!entity) {
      return ability.can(caslAction, subjectName)
    }

    const mappedSubject = this.mapEntityToCaslSubject(subjectName, entity)
    const caslSubjectObj = subject(subjectName, mappedSubject as never)

    return ability.can(caslAction, caslSubjectObj)
  }
}
