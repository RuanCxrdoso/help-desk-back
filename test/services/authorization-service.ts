import {
  DomainAction,
  DomainSubject,
  IAuthorizationService,
} from '@/domain/help-desk/application/auth/authorization.service'
import { TokenPayload } from '@/infra/http/auth/jwt.strategy'
import { vi } from 'vitest'

export class FakeAuthorizationService implements IAuthorizationService {
  public authorizeSpy = vi.fn().mockReturnValue(true)

  public mockAuthorization(value: boolean) {
    this.authorizeSpy.mockReturnValue(value)
  }

  authorize(
    callerPayload: TokenPayload,
    action: DomainAction,
    subjectName: DomainSubject,
    entity?: any,
  ): boolean {
    return this.authorizeSpy(callerPayload, action, subjectName, entity)
  }
}
