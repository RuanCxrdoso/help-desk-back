import { UniqueEntityID } from './unique-entity-id'

export abstract class Entity<Props> {
  protected props: Props
  private _id: UniqueEntityID

  get id() {
    return this._id.toString()
  }

  public equals(entity: Entity<unknown>) {
    if (this === entity) return true

    if (entity === null || entity === undefined) {
      return false
    }

    return this._id.equals(entity._id)
  }

  protected constructor(props: Props, id?: UniqueEntityID) {
    this.props = props
    this._id = id ?? new UniqueEntityID()
  }
}
