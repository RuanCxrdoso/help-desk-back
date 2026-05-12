import { IUsersRepository } from '@/domain/help-desk/application/repositories/users-repository'
import { User } from '@/domain/help-desk/enterprise/entities/user'

export class InMemoryUsersRepository implements IUsersRepository {
  public items: User<any>[] = []

  async findByEmail(
    email: string,
    tenantId: string,
  ): Promise<User<any> | null> {
    const user = this.items.find(
      (item) =>
        item.email.value === email && item.tenantId.toString() === tenantId,
    )

    if (!user) {
      return null
    }

    return user
  }
}
