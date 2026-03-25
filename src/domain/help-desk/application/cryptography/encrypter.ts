export abstract class IEncrypter {
  abstract encrypt(payload: Record<string, unknown>): Promise<string>
}
