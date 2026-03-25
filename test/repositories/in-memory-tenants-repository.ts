import { ITenantsRepository } from '@/domain/help-desk/application/repositories/tenants-repository'
import { Tenant } from '@/domain/help-desk/enterprise/entities/tenant'

export class InMemoryTenantsRepository implements ITenantsRepository {
  public items: Tenant[] = []

  async findById(id: string): Promise<Tenant | null> {
    const tenant = this.items.find((item) => item.id.toString() === id)

    if (!tenant) return null

    return tenant
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const tenant = this.items.find((item) => item.slug === slug)

    if (!tenant) return null

    return tenant
  }
}
