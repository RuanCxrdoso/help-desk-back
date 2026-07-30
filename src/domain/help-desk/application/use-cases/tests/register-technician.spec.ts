import { IHashGenerator } from '../../cryptography/hash-generator'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { UserAlreadyExistsError } from '../../errors/user-already-exists-error'
import { InMemoryTechniciansRepository } from 'test/repositories/in-memory-technicians-repository'
import { RegisterTechnicianUseCase } from '../register-technician'
import { Technician } from '@/domain/help-desk/enterprise/entities/technician'
import { InMemoryTenantsRepository } from 'test/repositories/in-memory-tenants-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Tenant } from '@/domain/help-desk/enterprise/entities/tenant'
import { NotFoundError } from '../../errors/not-found-error'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'

let hasher: IHashGenerator
let tenantsRepository: InMemoryTenantsRepository
let usersRepository: InMemoryUsersRepository
let techniciansRepository: InMemoryTechniciansRepository
let sut: RegisterTechnicianUseCase

describe('Register Technician', () => {
  beforeEach(() => {
    hasher = new FakeHasher()
    tenantsRepository = new InMemoryTenantsRepository()
    usersRepository = new InMemoryUsersRepository()
    techniciansRepository = new InMemoryTechniciansRepository(usersRepository)
    sut = new RegisterTechnicianUseCase(
      tenantsRepository,
      techniciansRepository,
      usersRepository,
      hasher,
    )
  })

  it('should be able to register a technician', async () => {
    const tenant = Tenant.create(
      {
        name: 'Acme corp',
        status: 'ACTIVE',
      },
      new UniqueEntityID(),
    )

    tenantsRepository.items.push(tenant)

    const result = await sut.execute({
      firstName: 'Steve',
      lastName: 'Adams',
      password: '123456',
      email: 'steveadams@email.com',
      tenantId: tenant.id.toString(),
      supportLevel: 2,
      specialties: ['Networking', 'Hardware'],
      isActive: true,
    })

    expect(result.isRight()).toBeTruthy()
    expect(techniciansRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: EmailValueObject.create('steveadams@email.com'),
          password: 'password-hashed-123456',
        }),
      ]),
    )
  })

  it('shouldn`t be able to register a technician with same email', async () => {
    const tenant = Tenant.create(
      {
        name: 'Acme corp',
        status: 'ACTIVE',
      },
      new UniqueEntityID(),
    )

    tenantsRepository.items.push(tenant)

    const technician = Technician.create({
      tenantId: tenant.id,
      firstName: 'James',
      lastName: 'Stewart',
      email: EmailValueObject.create('jamesstewart@email.com'),
      password: '123456',
      supportLevel: 2,
      specialties: ['Networking', 'Hardware'],
      isActive: true,
    })

    await techniciansRepository.create(technician)

    const result = await sut.execute({
      tenantId: tenant.id.toString(),
      firstName: 'James',
      lastName: 'Stewart',
      email: 'jamesstewart@email.com',
      password: '123456',
      supportLevel: 2,
      specialties: ['Networking', 'Hardware'],
      isActive: true,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })

  it('shouldn`t be able to register an technician if tenant doesn`t exists', async () => {
    const result = await sut.execute({
      tenantId: 'tenant-id-1',
      firstName: 'Steve',
      lastName: 'Adams',
      email: 'steveadams@email.com',
      password: '123456',
      supportLevel: 2,
      specialties: ['Networking', 'Hardware'],
      isActive: true,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotFoundError)
  })
})
