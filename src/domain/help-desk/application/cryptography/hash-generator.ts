export abstract class IHashGenerator {
  abstract hash(password: string): Promise<string>
}
