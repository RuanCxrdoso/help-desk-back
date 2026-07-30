import { User } from '../../enterprise/entities/user'

export abstract class IUsersRepository {
  abstract findByEmail(
    email: string,
    tenantId: string,
  ): Promise<User<any> | null>

  abstract findById(id: string): Promise<User<any> | null>
}
