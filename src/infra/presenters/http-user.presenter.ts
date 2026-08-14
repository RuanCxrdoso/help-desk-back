import { User } from '@/domain/help-desk/enterprise/entities/user'

export class HttpUserPresenter {
  static toHttp(user: User<any>) {
    return {
      id: user.id.toString(),
      tenantId: user.tenantId.toString(),
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email.value,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    }
  }
}
