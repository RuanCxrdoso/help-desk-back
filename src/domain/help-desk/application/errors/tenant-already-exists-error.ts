import { DomainError } from '@/core/error/domain-error'
import { IUseCaseError } from '@/core/error/use-case-error'

export class TenantAlreadyExistsError
  extends DomainError
  implements IUseCaseError
{
  constructor() {
    super('Tenant already exists.')
  }
}
