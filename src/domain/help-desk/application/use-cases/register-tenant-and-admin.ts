import { ITenantAndAdminRegisterGateway } from '../repositories/tenant-and-admin-register-gateway'
import { ITenantsRepository } from '../repositories/tenants-repository'
import { Either, left, right } from '@/core/error/either'
import { TenantAlreadyExistsError } from '../errors/tenant-already-exists-error'
import { Tenant } from '../../enterprise/entities/tenant'
import { Slug } from '../../enterprise/entities/value-objects/slug-value-object'
import { Admin } from '../../enterprise/entities/admin'
import { EmailValueObject } from '../../enterprise/entities/value-objects/email-value-object'
import { IHashGenerator } from '../cryptography/hash-generator'
import { TENANT_STATUS } from 'generated/prisma/enums'

interface RegisterTenantAndAdminUseCaseRequest {
  tenant: {
    name: string
    slug: string
    status: TENANT_STATUS
  }
  admin: {
    firstName: string
    lastName: string
    email: string
    password: string
    department: string
    jobTitle: string
    isActive: boolean
  }
}

type RegisterTenantAndAdminUseCaseResponse = Either<
  TenantAlreadyExistsError,
  null
>

export class RegisterTenantAndAdminUseCase {
  constructor(
    private tenantAndAdminRegister: ITenantAndAdminRegisterGateway,
    private hashGenerator: IHashGenerator,
    private tenantsRepository: ITenantsRepository,
  ) {}

  async execute({
    tenant,
    admin,
  }: RegisterTenantAndAdminUseCaseRequest): Promise<RegisterTenantAndAdminUseCaseResponse> {
    const tenantExists = await this.tenantsRepository.findBySlug(tenant.slug)

    if (tenantExists) return left(new TenantAlreadyExistsError())

    const newTenant = Tenant.create({
      name: tenant.name,
      slug: Slug.createFromText(tenant.slug),
      status: tenant.status,
    })

    const adminHashedPassword = await this.hashGenerator.hash(admin.password)

    const tenantAdmin = Admin.create({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: EmailValueObject.create(admin.email),
      password: adminHashedPassword,
      tenantId: newTenant.id,
      department: admin.department,
      jobTitle: admin.jobTitle,
      isActive: admin.isActive,
    })

    await this.tenantAndAdminRegister.register(newTenant, tenantAdmin)

    return right(null)
  }
}
