import { RegisterAdminUseCase } from '../register-admin'
import { IHashGenerator } from '../../cryptography/hash-generator'
import { Hasher } from 'test/cryptography/hasher'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { SuperAdmin } from '@/domain/help-desk/enterprise/entities/super-admin'
import { InMemorySuperAdminsRepository } from 'test/repositories/in-memory-super-admins-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { Admin } from '@/domain/help-desk/enterprise/entities/admin'
import { UserAlreadyExistsError } from '../../errors/user-already-exists-error'

let hasher: IHashGenerator
let adminsRepository: InMemoryAdminsRepository
let superAdminsRepository: InMemorySuperAdminsRepository
let sut: RegisterAdminUseCase

describe('Register Admin', () => {
  beforeEach(() => {
    hasher = new Hasher()
    adminsRepository = new InMemoryAdminsRepository()
    superAdminsRepository = new InMemorySuperAdminsRepository()
    sut = new RegisterAdminUseCase(
      adminsRepository,
      superAdminsRepository,
      hasher,
    )
  })

  it('should be able to register a admin', async () => {
    const superAdmin = SuperAdmin.create({
      firstName: 'John',
      lastName: 'Doe',
      email: EmailValueObject.create('johndoe@email.com'),
      password: '123456',
    })

    superAdminsRepository.items.push(superAdmin)

    const result = await sut.execute({
      creatorId: superAdmin.id.toString(),
      firstName: 'Steve',
      lastName: 'Adams',
      password: '123456',
      email: 'steveadams@email.com',
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

  it('shouldn`t be able to register a admin without SUPER ADMIN role', async () => {
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

  it('shouldn`t be able to register a admin with same email', async () => {
    const superAdmin = SuperAdmin.create({
      firstName: 'John',
      lastName: 'Doe',
      email: EmailValueObject.create('johndoe@email.com'),
      password: '123456',
    })

    superAdminsRepository.items.push(superAdmin)

    const admin = Admin.create({
      firstName: 'John',
      lastName: 'Doe',
      email: EmailValueObject.create('steveadams@email.com'),
      password: '123456',
    })

    adminsRepository.items.push(admin)

    const result = await sut.execute({
      creatorId: superAdmin.id.toString(),
      firstName: 'Steve',
      lastName: 'Adams',
      password: '123456',
      email: 'steveadams@email.com',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })
})
