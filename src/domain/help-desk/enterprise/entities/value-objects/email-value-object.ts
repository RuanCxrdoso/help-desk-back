import { ValueObject } from '@/core/entities/value-object'

export interface EmailProps {
  value: string
}

export class EmailValueObject extends ValueObject<EmailProps> {
  get value(): string {
    return this.props.value
  }

  static create(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      throw new Error('Formato de e-mail inválido.')
    }

    return new EmailValueObject({ value: email })
  }
}
