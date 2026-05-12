import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { InMemoryTenantsRepository } from 'test/repositories/in-memory-tenants-repository'
import { AuthenticateUseCase } from '../authenticate'
import { makeTenant } from 'test/factories/make-tenant'
import { makeTechnician } from 'test/factories/make-technician'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InvalidCredentialsError } from '../../errors/invalid-credentials-error'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'

let usersRepository: InMemoryUsersRepository
let tenantsRepository: InMemoryTenantsRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter
let sut: AuthenticateUseCase

describe('Authenticate', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    tenantsRepository = new InMemoryTenantsRepository()
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()
    sut = new AuthenticateUseCase(
      usersRepository,
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

    usersRepository.items.push(technician)

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

    usersRepository.items.push(technician)

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

    usersRepository.items.push(technician)

    const result = await sut.execute({
      email: technician.email.value,
      password: 'wrong-password',
      tenantSlug: tenant.slug,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })
})
