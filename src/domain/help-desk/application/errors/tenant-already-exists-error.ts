import { IUseCaseError } from '@/core/error/use-case-error'

export class TenantAlreadyExistsError extends Error implements IUseCaseError {
  constructor() {
    super('Tenant already exists.')
  }
}
