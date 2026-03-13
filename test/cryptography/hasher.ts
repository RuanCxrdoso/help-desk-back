import { IHashGenerator } from '@/domain/help-desk/application/cryptography/hash-generator'

export class Hasher implements IHashGenerator {
  async hash(password: string) {
    return `password-hashed-${password}`
  }
}
