import { IUseCaseError } from '@/core/error/use-case-error'

export class InvalidCredentialsError extends Error implements IUseCaseError {
  constructor() {
    super('Invalid credentials.')
  }
}
