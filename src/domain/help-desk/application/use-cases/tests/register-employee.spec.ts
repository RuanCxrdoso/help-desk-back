import { IHashGenerator } from '../../cryptography/hash-generator'
import { Hasher } from 'test/cryptography/hasher'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { Admin } from '@/domain/help-desk/enterprise/entities/admin'
import { UserAlreadyExistsError } from '../../errors/user-already-exists-error'
import { InMemoryEmployeesRepository } from 'test/repositories/in-memory-employees-repository'
import { Employee } from '@/domain/help-desk/enterprise/entities/employee'
import { RegisterEmployeeUseCase } from '../register-employee'

let hasher: IHashGenerator
let adminsRepository: InMemoryAdminsRepository
let employeesRepository: InMemoryEmployeesRepository
let sut: RegisterEmployeeUseCase

describe('Register Employee', () => {
  beforeEach(() => {
    hasher = new Hasher()
    adminsRepository = new InMemoryAdminsRepository()
    employeesRepository = new InMemoryEmployeesRepository()
    sut = new RegisterEmployeeUseCase(
      employeesRepository,
      adminsRepository,
      hasher,
    )
  })

  it('should be able to register a employee', async () => {
    const admin = Admin.create({
      firstName: 'John',
      lastName: 'Doe',
      email: EmailValueObject.create('johndoe@email.com'),
      password: '123456',
    })

    adminsRepository.items.push(admin)

    const result = await sut.execute({
      creatorId: admin.id.toString(),
      firstName: 'Steve',
      lastName: 'Adams',
      password: '123456',
      email: 'steveadams@email.com',
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

  it('shouldn`t be able to register a employee without ADMIN role', async () => {
    const result = await sut.execute({
      creatorId: '241243124123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@email.com',
      password: '123456',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('shouldn`t be able to register a employee with same email', async () => {
    const admin = Admin.create({
      firstName: 'John',
      lastName: 'Doe',
      email: EmailValueObject.create('johndoe@email.com'),
      password: '123456',
    })

    adminsRepository.items.push(admin)

    const employee = Employee.create({
      firstName: 'James',
      lastName: 'Stewart',
      email: EmailValueObject.create('jamesstewart@email.com'),
      password: '123456',
    })

    employeesRepository.items.push(employee)

    const result = await sut.execute({
      creatorId: admin.id.toString(),
      firstName: 'James',
      lastName: 'Stewart',
      email: 'jamesstewart@email.com',
      password: '123456',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })
})
