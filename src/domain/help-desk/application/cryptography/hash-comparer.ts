export abstract class IHashComparer {
  abstract compare(plain: string, hash: string): Promise<boolean>
}
