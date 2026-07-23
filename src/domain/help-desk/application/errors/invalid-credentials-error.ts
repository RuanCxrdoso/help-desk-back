import { DomainError } from '@/core/error/domain-error'
import { IUseCaseError } from '@/core/error/use-case-error'

export class InvalidCredentialsError
  extends DomainError
  implements IUseCaseError
{
  constructor() {
    super('Invalid credentials.')
  }
}
