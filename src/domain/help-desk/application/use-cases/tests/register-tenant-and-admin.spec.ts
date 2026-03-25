import { FakeHasher } from 'test/cryptography/fake-hasher'
import { TenantAndAdminRegisterGatewayTest } from 'test/gateways/tenant-and-admin-register-gateway'
import { InMemoryTenantsRepository } from 'test/repositories/in-memory-tenants-repository'
import { RegisterTenantAndAdminUseCase } from '../register-tenant-and-admin'
import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { makeTenant } from 'test/factories/make-tenant'
import { Slug } from '@/domain/help-desk/enterprise/entities/value-objects/slug-value-object'
import { TenantAlreadyExistsError } from '../../errors/tenant-already-exists-error'

let tenantAndAdminRegister: TenantAndAdminRegisterGatewayTest
let hasher: FakeHasher
let tenantsRepository: InMemoryTenantsRepository
let adminsRepository: InMemoryAdminsRepository
let sut: RegisterTenantAndAdminUseCase

describe('Register Tenant and Admin', () => {
  beforeEach(() => {
    tenantsRepository = new InMemoryTenantsRepository()
    adminsRepository = new InMemoryAdminsRepository()
    tenantAndAdminRegister = new TenantAndAdminRegisterGatewayTest(
      tenantsRepository,
      adminsRepository,
    )
    hasher = new FakeHasher()
    sut = new RegisterTenantAndAdminUseCase(
      tenantAndAdminRegister,
      hasher,
      tenantsRepository,
    )
  })

  it('should be able to register a tenant and an admin', async () => {
    const result = await sut.execute({
      tenant: {
        name: 'Tenant 1',
        slug: 'tenant-1',
      },
      admin: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password',
      },
    })

    expect(result.isRight()).toBeTruthy()
    expect(tenantsRepository.items).toHaveLength(1)
    expect(adminsRepository.items).toHaveLength(1)
    expect(tenantsRepository.items[0].name).toBe('Tenant 1')
    expect(adminsRepository.items[0].firstName).toBe('Admin')
    expect(adminsRepository.items[0].password).toBe('password-hashed-password')
  })

  it('shouldn`t be able to create a tenant with an existent slug', async () => {
    const tenant = makeTenant({
      name: 'Registered Tenant',
      slug: Slug.create('registerd-tenant'),
    })

    tenantsRepository.items.push(tenant)

    const result = await sut.execute({
      tenant: {
        name: 'Registed Tenant',
        slug: 'registerd-tenant',
      },
      admin: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password',
      },
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(TenantAlreadyExistsError)
  })
})
