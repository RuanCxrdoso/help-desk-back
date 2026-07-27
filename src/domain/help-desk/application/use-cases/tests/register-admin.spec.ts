import { RegisterAdminUseCase } from '../register-admin'
import { IHashGenerator } from '../../cryptography/hash-generator'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { SuperAdmin } from '@/domain/help-desk/enterprise/entities/super-admin'
import { InMemorySuperAdminsRepository } from 'test/repositories/in-memory-super-admins-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
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
let superAdminsRepository: InMemorySuperAdminsRepository
let sut: RegisterAdminUseCase

describe('Register Admin', () => {
  beforeEach(() => {
    hasher = new FakeHasher()
    tenantsRepository = new InMemoryTenantsRepository()
    usersRepository = new InMemoryUsersRepository()
    adminsRepository = new InMemoryAdminsRepository(usersRepository)
    superAdminsRepository = new InMemorySuperAdminsRepository()
    sut = new RegisterAdminUseCase(
      tenantsRepository,
      adminsRepository,
      superAdminsRepository,
      usersRepository,
      hasher,
    )
  })

  it('should be able to register an admin', async () => {
    const superAdmin = SuperAdmin.create({
      firstName: 'John',
      lastName: 'Doe',
      email: EmailValueObject.create('johndoe@email.com'),
      password: '123456',
    })

    superAdminsRepository.items.push(superAdmin)

    const tenant = Tenant.create(
      {
        name: 'Acme corp',
        status: 'ACTIVE',
      },
      new UniqueEntityID('tenant-id-1'),
    )

    tenantsRepository.items.push(tenant)

    const result = await sut.execute({
      creatorId: superAdmin.id.toString(),
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

  it('shouldn`t be able to register an admin without SUPER ADMIN role', async () => {
    const tenant = Tenant.create({
      name: 'Acme corp',
      status: 'ACTIVE',
    })

    tenantsRepository.items.push(tenant)

    const result = await sut.execute({
      creatorId: '241243124123',
      tenantId: tenant.id.toString(),
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@email.com',
      password: '123456',
      department: 'IT',
      jobTitle: 'System Administrator',
      isActive: true,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('shouldn`t be able to register an admin with same email', async () => {
    const superAdmin = SuperAdmin.create({
      firstName: 'John',
      lastName: 'Doe',
      email: EmailValueObject.create('johndoe@email.com'),
      password: '123456',
    })

    superAdminsRepository.items.push(superAdmin)

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
      creatorId: superAdmin.id.toString(),
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
    const superAdmin = SuperAdmin.create({
      firstName: 'John',
      lastName: 'Doe',
      email: EmailValueObject.create('johndoe@email.com'),
      password: '123456',
    })

    superAdminsRepository.items.push(superAdmin)

    const result = await sut.execute({
      tenantId: 'tenant-id-1',
      creatorId: superAdmin.id.toString(),
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
