import { IHashComparer } from '@/domain/help-desk/application/cryptography/hash-comparer'
import { IHashGenerator } from '@/domain/help-desk/application/cryptography/hash-generator'

export class FakeHasher implements IHashGenerator, IHashComparer {
  async hash(password: string) {
    return `password-hashed-${password}`
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return `password-hashed-${plain}` === hash
  }
}
