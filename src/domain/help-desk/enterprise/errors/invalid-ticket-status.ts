import { DomainError } from '@/core/error/domain-error'

export class InvalidTicketStatusError extends DomainError {
  constructor(action: string, currentStatus: string) {
    super(`Cannot ${action} a ticket with '${currentStatus}' status.`)
  }
}
