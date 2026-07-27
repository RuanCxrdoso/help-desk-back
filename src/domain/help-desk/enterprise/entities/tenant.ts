import { Entity } from '@/core/entities/entity'
import { Slug } from './value-objects/slug-value-object'
import { Optional } from '@/core/types/optional'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { TENANT_STATUS } from 'generated/prisma/enums'

export interface TenantProps {
  name: string
  slug: Slug
  status: TENANT_STATUS
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

export class Tenant extends Entity<TenantProps> {
  get name() {
    return this.props.name
  }

  get slug() {
    return this.props.slug.value
  }

  get status() {
    return this.props.status
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get deletedAt() {
    return this.props.deletedAt
  }

  set name(value: string) {
    this.props.name = value

    this.touch()
  }

  set slug(value: string) {
    this.props.slug = Slug.createFromText(value)

    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<
      TenantProps,
      'createdAt' | 'updatedAt' | 'deletedAt' | 'slug'
    >,
    id?: UniqueEntityID,
  ) {
    const tenant = new Tenant(
      {
        slug: props.slug ?? Slug.createFromText(props.name),
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
        ...props,
      },
      id ?? new UniqueEntityID(),
    )

    return tenant
  }
}
