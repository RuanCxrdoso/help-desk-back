import { IUseCaseError } from '@/core/error/use-case-error'

export class UserAlreadyExistsError extends Error implements IUseCaseError {
  constructor() {
    super('User already exists.')
  }
}
