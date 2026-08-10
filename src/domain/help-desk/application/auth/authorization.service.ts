import { TokenPayload } from '@/infra/http/auth/jwt.strategy'

export type DomainAction =
  | 'manage'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'assign'
  | 'unassign'
  | 'cancel'
  | 'close'
  | 'reopen'
  | 'resolve'

export type DomainSubject = 'User' | 'SuperAdmin' | 'Ticket' | 'Tenant' | 'all'

export abstract class IAuthorizationService {
  abstract authorize(
    callerPayload: TokenPayload,
    action: DomainAction,
    subjectName: DomainSubject,
    entity?: any,
  ): boolean
}
