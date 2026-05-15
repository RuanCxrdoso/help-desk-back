import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { TicketPriorityType } from '@/core/enums/ticket-priority'
import { TICKET_STATUS, TicketStatusType } from '@/core/enums/ticket-status'
import { Optional } from '@/core/types/optional'
import { InvalidTicketStatusError } from '../errors/invalid-ticket-status'

export interface TicketProps {
  employeeId: UniqueEntityID
  technicianId: UniqueEntityID | null
  title: string
  description: string
  status: TicketStatusType
  priority: TicketPriorityType
  createdAt: Date
  updatedAt?: Date | null
  tenantId: UniqueEntityID
}

export class Ticket extends Entity<TicketProps> {
  get employeeId() {
    return this.props.employeeId
  }

  get technicianId() {
    return this.props.technicianId
  }

  get title() {
    return this.props.title
  }

  get description() {
    return this.props.description
  }

  get status() {
    return this.props.status
  }

  get priority() {
    return this.props.priority
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get tenantId() {
    return this.props.tenantId
  }

  set title(title: string) {
    this.props.title = title

    this.touch()
  }

  set description(description: string) {
    this.props.description = description

    this.touch()
  }

  set priority(priority: TicketPriorityType) {
    this.props.priority = priority

    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  // Delega o ticket para um técnico (TÉCNICO/ADMIN)
  public assignTo(
    technicianId: UniqueEntityID,
  ): InvalidTicketStatusError | void {
    if (this.props.technicianId === technicianId) return

    const allowedStatuses = ['OPEN', 'IN_PROGRESS']

    if (!allowedStatuses.includes(this.props.status)) {
      return new InvalidTicketStatusError('assign', this.props.status)
    }

    this.props.technicianId = technicianId

    this.props.status = TICKET_STATUS.IN_PROGRESS

    this.touch()
  }

  // Remove o técnico do ticket (TÉCNICO/ADMIN)
  public unassign(): InvalidTicketStatusError | void {
    if (this.props.technicianId === null) return

    const allowedStatuses = ['OPEN', 'IN_PROGRESS']

    if (!allowedStatuses.includes(this.props.status)) {
      return new InvalidTicketStatusError('unassign', this.props.status)
    }

    this.props.technicianId = null
    this.props.status = TICKET_STATUS.OPEN

    this.touch()
  }

  // Marca o ticket como resolvido (TÉCNICO/ADMIN)
  public resolve(): InvalidTicketStatusError | void {
    if (this.props.status === TICKET_STATUS.RESOLVED) return

    const allowedStatuses = ['OPEN', 'IN_PROGRESS']

    if (!allowedStatuses.includes(this.props.status)) {
      return new InvalidTicketStatusError('resolve', this.props.status)
    }

    this.props.status = TICKET_STATUS.RESOLVED
    this.touch()
  }

  // Cancela o ticket (TODOS)
  public cancel(): InvalidTicketStatusError | void {
    if (this.props.status === TICKET_STATUS.CANCELLED) return

    const allowedStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED']

    if (!allowedStatuses.includes(this.props.status)) {
      return new InvalidTicketStatusError('cancel', this.props.status)
    }

    this.props.status = TICKET_STATUS.CANCELLED
    this.touch()
  }

  // Fecha o ticket (TODOS)
  public close(): InvalidTicketStatusError | void {
    if (this.props.status === TICKET_STATUS.CLOSED) return

    const allowedStatuses = ['RESOLVED']

    if (!allowedStatuses.includes(this.props.status)) {
      return new InvalidTicketStatusError('close', this.props.status)
    }

    this.props.status = TICKET_STATUS.CLOSED
    this.touch()
  }

  // Reabre o ticket (TODOS)
  public reopen() {
    if (this.props.status === TICKET_STATUS.OPEN) return

    this.props.status = TICKET_STATUS.OPEN
    this.props.technicianId = null
    this.touch()
  }

  static create(
    props: Optional<TicketProps, 'createdAt' | 'updatedAt' | 'status'>,
    id?: UniqueEntityID,
  ) {
    const ticket = new Ticket(
      {
        createdAt: props.createdAt ?? new Date(),
        status: props.status ?? TICKET_STATUS.OPEN,
        ...props,
      },
      id ?? new UniqueEntityID(),
    )

    return ticket
  }
}
