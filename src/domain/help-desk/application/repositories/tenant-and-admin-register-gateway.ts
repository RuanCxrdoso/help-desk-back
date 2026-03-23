import { Admin } from '../../enterprise/entities/admin'
import { Tenant } from '../../enterprise/entities/tenant'

export abstract class ITenantAndAdminRegisterGateway {
  abstract register(tenant: Tenant, admin: Admin): Promise<void>
}
