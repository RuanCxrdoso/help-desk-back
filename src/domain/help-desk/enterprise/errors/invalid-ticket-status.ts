export class InvalidTicketStatusError extends Error {
  constructor(action: string, currentStatus: string) {
    super(`Cannot ${action} a ticket with '${currentStatus}' status.`)
  }
}
