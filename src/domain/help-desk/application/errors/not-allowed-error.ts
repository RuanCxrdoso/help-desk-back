import { IUseCaseError } from '@/core/error/use-case-error'

export class NotAllowedError extends Error implements IUseCaseError {
  constructor() {
    super('Not Allowed.')
  }
}
