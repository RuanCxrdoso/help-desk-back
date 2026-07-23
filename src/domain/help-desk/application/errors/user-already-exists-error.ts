import { DomainError } from '@/core/error/domain-error'
import { IUseCaseError } from '@/core/error/use-case-error'

export class UserAlreadyExistsError
  extends DomainError
  implements IUseCaseError
{
  constructor() {
    super('User already exists.')
  }
}
