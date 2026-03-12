import { IUseCaseError } from '@/core/error/use-case-error'

export class NotFoundError extends Error implements IUseCaseError {
  constructor() {
    super('Not Found.')
  }
}
