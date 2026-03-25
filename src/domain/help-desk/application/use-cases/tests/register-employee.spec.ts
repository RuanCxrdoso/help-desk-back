import { IHashGenerator } from '../../cryptography/hash-generator'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { Admin } from '@/domain/help-desk/enterprise/entities/admin'
import { UserAlreadyExistsError } from '../../errors/user-already-exists-error'
import { InMemoryEmployeesRepository } from 'test/repositories/in-memory-employees-repository'
import { Employee } from '@/domain/help-desk/enterprise/entities/employee'
import { RegisterEmployeeUseCase } from '../register-employee'
import { InMemoryTenantsRepository } from 'test/repositories/in-memory-tenants-repository'
import { Tenant } from '@/domain/help-desk/enterprise/entities/tenant'
import { NotFoundError } from '../../errors/not-found-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let hasher: IHashGenerator
let tenantsRepository: InMemoryTenantsRepository
let adminsRepository: InMemoryAdminsRepository
let employeesRepository: InMemoryEmployeesRepository
let sut: RegisterEmployeeUseCase

describe('Register Employee', () => {
  beforeEach(() => {
    hasher = new FakeHasher()
    tenantsRepository = new InMemoryTenantsRepository()
    adminsRepository = new InMemoryAdminsRepository()
    employeesRepository = new InMemoryEmployeesRepository()
    sut = new RegisterEmployeeUseCase(
      tenantsRepository,
      employeesRepository,
      adminsRepository,
      hasher,
    )
  })

  it('should be able to register an employee', async () => {
    const tenant = Tenant.create({
      name: 'Acme corp',
    })

    tenantsRepository.items.push(tenant)

    const admin = Admin.create({
      firstName: 'John',
      lastName: 'Doe',
      email: EmailValueObject.create('johndoe@email.com'),
      password: '123456',
      tenantId: tenant.id,
    })

    adminsRepository.items.push(admin)

    const result = await sut.execute({
      creatorId: admin.id.toString(),
      firstName: 'Steve',
      lastName: 'Adams',
      password: '123456',
      email: 'steveadams@email.com',
      tenantId: tenant.id.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(employeesRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: EmailValueObject.create('steveadams@email.com'),
          password: 'password-hashed-123456',
        }),
      ]),
    )
  })

  it('shouldn`t be able to register an employee without ADMIN role', async () => {
    const tenant = Tenant.create({
      name: 'Acme corp',
    })

    tenantsRepository.items.push(tenant)

    const result = await sut.execute({
      creatorId: '241243124123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@email.com',
      password: '123456',
      tenantId: tenant.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('shouldn`t be able to register an employee with same email', async () => {
    const tenant = Tenant.create({
      name: 'Acme corp',
    })

    tenantsRepository.items.push(tenant)

    const admin = Admin.create({
      firstName: 'John',
      lastName: 'Doe',
      email: EmailValueObject.create('johndoe@email.com'),
      password: '123456',
      tenantId: tenant.id,
    })

    adminsRepository.items.push(admin)

    const employee = Employee.create({
      firstName: 'James',
      lastName: 'Stewart',
      email: EmailValueObject.create('jamesstewart@email.com'),
      password: '123456',
      tenantId: tenant.id,
    })

    employeesRepository.items.push(employee)

    const result = await sut.execute({
      creatorId: admin.id.toString(),
      firstName: 'James',
      lastName: 'Stewart',
      email: 'jamesstewart@email.com',
      password: '123456',
      tenantId: tenant.id.toString(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })

  it('shouldn`t be able to register an employee if tenant doesn`t exists', async () => {
    const admin = Admin.create({
      firstName: 'John',
      lastName: 'Doe',
      email: EmailValueObject.create('johndoe@email.com'),
      password: '123456',
      tenantId: new UniqueEntityID('non-existing-tenant-id'),
    })

    adminsRepository.items.push(admin)

    const result = await sut.execute({
      creatorId: admin.id.toString(),
      firstName: 'Lamine',
      lastName: 'Yamal',
      email: 'lamineyamal@email.com',
      password: '123456',
      tenantId: 'non-existing-tenant-id',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotFoundError)
  })
})
