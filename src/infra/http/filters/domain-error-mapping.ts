import { HttpStatus } from '@nestjs/common'
import { TenantAlreadyExistsError } from '@/domain/help-desk/application/errors/tenant-already-exists-error'
import { UserAlreadyExistsError } from '@/domain/help-desk/application/errors/user-already-exists-error'
import { NotFoundError } from '@/domain/help-desk/application/errors/not-found-error'
import { NotAllowedError } from '@/domain/help-desk/application/errors/not-allowed-error'
import { InvalidCredentialsError } from '@/domain/help-desk/application/errors/invalid-credentials-error'
import { DomainError } from '@/core/error/domain-error'

type ErrorConstructor = new (...args: any[]) => DomainError

export const domainErrorMapping = new Map<ErrorConstructor, HttpStatus>([
  [TenantAlreadyExistsError, HttpStatus.CONFLICT],
  [UserAlreadyExistsError, HttpStatus.CONFLICT],
  [NotFoundError, HttpStatus.NOT_FOUND],
  [NotAllowedError, HttpStatus.FORBIDDEN],
  [InvalidCredentialsError, HttpStatus.UNAUTHORIZED],
])
