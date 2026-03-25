import { IEncrypter } from '@/domain/help-desk/application/cryptography/encrypter'

export class FakeEncrypter implements IEncrypter {
  async encrypt(payload: Record<string, unknown>): Promise<string> {
    return JSON.stringify(payload)
  }
}
