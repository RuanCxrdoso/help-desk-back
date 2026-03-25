import { InMemorySuperAdminsRepository } from 'test/repositories/in-memory-super-admins-repository'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { AuthenticateSuperAdminUseCase } from '../authenticate-super-admin'
import { makeSuperAdmin } from 'test/factories/make-super-admin'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'

let superAdminsRepository: InMemorySuperAdminsRepository
let hasher: FakeHasher
let encrypter: FakeEncrypter
let sut: AuthenticateSuperAdminUseCase

describe('Authenticate Super Admin', () => {
  beforeEach(() => {
    superAdminsRepository = new InMemorySuperAdminsRepository()
    hasher = new FakeHasher()
    encrypter = new FakeEncrypter()
    sut = new AuthenticateSuperAdminUseCase(
      superAdminsRepository,
      hasher,
      encrypter,
    )
  })

  it('should be able to authenticate a super admin', async () => {
    const superAdmin = makeSuperAdmin({
      email: EmailValueObject.create('johndoe@email.com'),
      password: await hasher.hash('password'),
    })

    await superAdminsRepository.create(superAdmin)

    const result = await sut.execute({
      email: 'johndoe@email.com',
      password: 'password',
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual({
      accessToken: JSON.stringify({
        sub: superAdmin.id.toString(),
        role: superAdmin.role,
      }),
    })
  })
})
