import { Tenant } from '../../enterprise/entities/tenant'

export abstract class ITenantsRepository {
  abstract findById(id: string): Promise<Tenant | null>
  abstract findBySlug(slug: string): Promise<Tenant | null>
}
