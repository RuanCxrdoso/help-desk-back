import { RegisterAdminUseCase } from '../register-admin'
import { IHashGenerator } from '../../cryptography/hash-generator'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { Admin } from '@/domain/help-desk/enterprise/entities/admin'
import { UserAlreadyExistsError } from '../../errors/user-already-exists-error'
import { InMemoryTenantsRepository } from 'test/repositories/in-memory-tenants-repository'
import { Tenant } from '@/domain/help-desk/enterprise/entities/tenant'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '../../errors/not-found-error'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'

let hasher: IHashGenerator
let tenantsRepository: InMemoryTenantsRepository
let usersRepository: InMemoryUsersRepository
let adminsRepository: InMemoryAdminsRepository
let sut: RegisterAdminUseCase

describe('Register Admin', () => {
  beforeEach(() => {
    hasher = new FakeHasher()
    tenantsRepository = new InMemoryTenantsRepository()
    usersRepository = new InMemoryUsersRepository()
    adminsRepository = new InMemoryAdminsRepository(usersRepository)
    sut = new RegisterAdminUseCase(
      tenantsRepository,
      adminsRepository,
      usersRepository,
      hasher,
    )
  })

  it('should be able to register an admin', async () => {
    const tenant = Tenant.create(
      {
        name: 'Acme corp',
        status: 'ACTIVE',
      },
      new UniqueEntityID('tenant-id-1'),
    )

    tenantsRepository.items.push(tenant)

    const result = await sut.execute({
      tenantId: 'tenant-id-1',
      firstName: 'Steve',
      lastName: 'Adams',
      email: 'steveadams@email.com',
      password: '123456',
      department: 'IT',
      jobTitle: 'System Administrator',
      isActive: true,
    })

    expect(result.isRight()).toBeTruthy()
    expect(adminsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: EmailValueObject.create('steveadams@email.com'),
          password: 'password-hashed-123456',
        }),
      ]),
    )
  })

  it('shouldn`t be able to register an admin with same email', async () => {
    const tenant = Tenant.create({
      name: 'Acme corp',
      status: 'ACTIVE',
    })

    tenantsRepository.items.push(tenant)

    const admin = Admin.create({
      tenantId: tenant.id,
      firstName: 'John',
      lastName: 'Doe',
      email: EmailValueObject.create('steveadams@email.com'),
      password: '123456',
      department: 'IT',
      jobTitle: 'System Administrator',
      isActive: true,
    })

    await adminsRepository.create(admin)

    const result = await sut.execute({
      tenantId: tenant.id.toString(),
      firstName: 'Steve',
      lastName: 'Adams',
      email: 'steveadams@email.com',
      password: '123456',
      department: 'IT',
      jobTitle: 'System Administrator',
      isActive: true,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })

  it('shouldn`t be able to register an admin if tenant doesn`t exists', async () => {
    const result = await sut.execute({
      tenantId: 'tenant-id-1',
      firstName: 'Steve',
      lastName: 'Adams',
      email: 'steveadams@email.com',
      password: '123456',
      department: 'IT',
      jobTitle: 'System Administrator',
      isActive: true,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotFoundError)
  })
})
