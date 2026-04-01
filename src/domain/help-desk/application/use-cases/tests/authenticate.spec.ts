import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { InMemoryEmployeesRepository } from 'test/repositories/in-memory-employees-repository'
import { InMemoryTechniciansRepository } from 'test/repositories/in-memory-technicians-repository'
import { InMemoryTenantsRepository } from 'test/repositories/in-memory-tenants-repository'
import { AuthenticateUseCase } from '../authenticate'
import { makeTenant } from 'test/factories/make-tenant'
import { makeTechnician } from 'test/factories/make-technician'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InvalidCredentialsError } from '../../errors/invalid-credentials-error'

let adminsRepository: InMemoryAdminsRepository
let techniciansRepository: InMemoryTechniciansRepository
let employeesRepository: InMemoryEmployeesRepository
let tenantsRepository: InMemoryTenantsRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter
let sut: AuthenticateUseCase

describe('Authenticate', () => {
  beforeEach(() => {
    adminsRepository = new InMemoryAdminsRepository()
    techniciansRepository = new InMemoryTechniciansRepository()
    employeesRepository = new InMemoryEmployeesRepository()
    tenantsRepository = new InMemoryTenantsRepository()
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()
    sut = new AuthenticateUseCase(
      adminsRepository,
      techniciansRepository,
      employeesRepository,
      tenantsRepository,
      fakeHasher,
      fakeEncrypter,
    )
  })

  it('should be able to authenticate a common user', async () => {
    const tenant = makeTenant({
      name: 'Fake Tenant',
    })

    tenantsRepository.items.push(tenant)

    const technician = makeTechnician({
      email: EmailValueObject.create('technician@email.com'),
      password: await fakeHasher.hash('password'),
      tenantId: tenant.id,
    })

    techniciansRepository.items.push(technician)

    const result = await sut.execute({
      email: technician.email.value,
      password: 'password',
      tenantSlug: tenant.slug,
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual({
      accessToken: JSON.stringify({
        sub: technician.id.toString(),
        role: technician.role,
        tenantId: tenant.id.toString(),
      }),
    })
  })

  it('shouldn`t be able to authenticate a user from another tenant', async () => {
    const tenant = makeTenant({
      name: 'Fake tenant',
    })

    tenantsRepository.items.push(tenant)

    const technician = makeTechnician({
      email: EmailValueObject.create('technician@email.com'),
      password: await fakeHasher.hash('password'),
      tenantId: new UniqueEntityID('id-from-another-tenant'),
    })

    techniciansRepository.items.push(technician)

    const result = await sut.execute({
      email: technician.email.value,
      password: 'password',
      tenantSlug: tenant.slug,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })

  it('shouldn`t be able to authenticate with wrong password', async () => {
    const tenant = makeTenant({
      name: 'Fake Tenant',
    })

    tenantsRepository.items.push(tenant)

    const technician = makeTechnician({
      email: EmailValueObject.create('technician@email.com'),
      password: await fakeHasher.hash('password'),
      tenantId: tenant.id,
    })

    techniciansRepository.items.push(technician)

    const result = await sut.execute({
      email: technician.email.value,
      password: 'wrong-password',
      tenantSlug: tenant.slug,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })
})
