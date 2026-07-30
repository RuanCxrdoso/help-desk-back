import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, type UserProps } from './user'

export interface AuthUserProps extends UserProps {
  // Caso precise de alguma propriedade exclusiva de sessão no futuro.
}

export class AuthUser extends User<AuthUserProps> {
  static create(props: AuthUserProps, id?: UniqueEntityID) {
    const authUser = new AuthUser(
      {
        ...props,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    )

    return authUser
  }
}
