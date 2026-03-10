import { randomUUID } from 'node:crypto'

export class UniqueEntityID {
  private _id: string

  public toString() {
    return this._id
  }

  public equals(id: UniqueEntityID) {
    return this._id === id._id
  }

  public constructor(id?: string) {
    this._id = id ?? randomUUID()
  }
}
