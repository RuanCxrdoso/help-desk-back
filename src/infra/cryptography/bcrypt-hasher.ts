import { IHashComparer } from '@/domain/help-desk/application/cryptography/hash-comparer'
import { IHashGenerator } from '@/domain/help-desk/application/cryptography/hash-generator'
import { Injectable } from '@nestjs/common'
import { hash, compare } from 'bcryptjs'

@Injectable()
export class BcryptHasher implements IHashComparer, IHashGenerator {
  private HASH_SALT_LENGTH = 8

  async hash(password: string): Promise<string> {
    return hash(password, this.HASH_SALT_LENGTH)
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash)
  }
}
