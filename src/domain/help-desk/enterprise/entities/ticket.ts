import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { TicketPriorityType } from '@/core/enums/ticket-priority'
import { TICKET_STATUS, TicketStatusType } from '@/core/enums/ticket-status'
import { Optional } from '@/core/types/optional'

export interface TicketProps {
  employeeId: UniqueEntityID
  technicianId: UniqueEntityID | null
  title: string
  description: string
  status: TicketStatusType
  priority: TicketPriorityType
  createdAt: Date
  updatedAt?: Date | null
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

  // Delega o ticket para um técnico (TÉCNICO) (OPEN => IN_PROGRESS)
  public assignTo(technicianId: UniqueEntityID) {
    if (this.props.status !== TICKET_STATUS.OPEN) {
      throw new Error(
        'Cannot assign a technician to a closed or cancelled ticket.',
      )
    }

    this.props.technicianId = technicianId
    this.props.status = TICKET_STATUS.IN_PROGRESS

    this.touch()
  }

  // Remove o técnico do ticket (TÉCNICO) (IN_PROGRESS => OPEN)
  public unassign() {
    if (this.props.technicianId === null) return
    if (this.props.status !== TICKET_STATUS.IN_PROGRESS) {
      throw new Error(
        `Cannot unassign a technician from a ticket with '${this.props.status} status'`,
      )
    }

    this.props.technicianId = null
    this.props.status = TICKET_STATUS.OPEN

    this.touch()
  }

  // Marca o ticket como resolvido (TÉCNICO) (IN_PROGRESS => RESOLVED)
  public resolve() {
    if (this.props.status !== TICKET_STATUS.IN_PROGRESS) {
      throw new Error('Only one ongoing ticket could be resolved.')
    }

    this.props.status = TICKET_STATUS.RESOLVED
    this.touch()
  }

  // Cancela o ticket (TÉCNICO E FUNCIONÁRIO) (OPEN ou IN_PROGRESS => CANCELLED)
  public cancel() {
    if (
      this.props.status === TICKET_STATUS.CANCELLED ||
      this.props.status === TICKET_STATUS.CLOSED
    ) {
      throw new Error(
        `Ticket with status '${this.props.status}' could not be cancelled.`,
      )
    }

    this.props.status = TICKET_STATUS.CANCELLED
    this.touch()
  }

  // Fecha o ticket (FUNCIONÁRIO) (RESOLVED => CLOSED)
  public close() {
    if (this.props.status !== TICKET_STATUS.RESOLVED) {
      throw new Error('Only resolved tickets could be closed.')
    }

    this.props.status = TICKET_STATUS.CLOSED
    this.touch()
  }

  // Reabre o ticket (FUNCIONÁRIO) (RESOLVED ou CLOSED => OPEN)
  public reopen() {
    if (
      this.props.status !== TICKET_STATUS.RESOLVED &&
      this.props.status !== TICKET_STATUS.CLOSED
    ) {
      throw new Error(
        `Ticket with status '${this.props.status}' could not be reopened.`,
      )
    }

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
