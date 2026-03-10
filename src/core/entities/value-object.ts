export abstract class ValueObject<Props> {
  protected props: Props

  public equals(valueObject: this): boolean {
    if (valueObject === null || valueObject === undefined) {
      return false
    }

    return JSON.stringify(valueObject.props) === JSON.stringify(this.props)
  }

  protected constructor(props: Props) {
    this.props = props
  }
}
