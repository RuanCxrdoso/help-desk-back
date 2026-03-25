import { ITenantAndAdminRegisterGateway } from '@/domain/help-desk/application/repositories/tenant-and-admin-register-gateway'
import { Admin } from '@/domain/help-desk/enterprise/entities/admin'
import { Tenant } from '@/domain/help-desk/enterprise/entities/tenant'
import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { InMemoryTenantsRepository } from 'test/repositories/in-memory-tenants-repository'

export class TenantAndAdminRegisterGatewayTest implements ITenantAndAdminRegisterGateway {
  constructor(
    private tenantsRepository: InMemoryTenantsRepository,
    private adminsRepository: InMemoryAdminsRepository,
  ) {}

  async register(tenant: Tenant, admin: Admin) {
    this.tenantsRepository.items.push(tenant)
    this.adminsRepository.items.push(admin)
  }
}
