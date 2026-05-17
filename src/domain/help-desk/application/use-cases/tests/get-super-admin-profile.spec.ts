import { makeSuperAdmin } from 'test/factories/make-super-admin'
import { InMemorySuperAdminsRepository } from 'test/repositories/in-memory-super-admins-repository'
import { GetSuperAdminProfileUseCase } from '../get-super-admin-profile'
import { NotAllowedError } from '../../errors/not-allowed-error'

let superAdminsRepository: InMemorySuperAdminsRepository
let sut: GetSuperAdminProfileUseCase

describe('Get SuperAdmin Profile', () => {
  beforeEach(() => {
    superAdminsRepository = new InMemorySuperAdminsRepository()
    sut = new GetSuperAdminProfileUseCase(superAdminsRepository)
  })

  it('should be able to get their profile', async () => {
    const superAdmin = makeSuperAdmin({
      firstName: 'Lewis Hamilton',
    })

    superAdminsRepository.items.push(superAdmin)

    const result = await sut.execute({
      id: superAdmin.id.toString(),
      role: superAdmin.role,
    })
    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual({
      superAdmin: expect.objectContaining({
        firstName: 'Lewis Hamilton',
      }),
    })
  })

  it('shouldn`t be able to get profile with wrong role', async () => {
    const superAdmin = makeSuperAdmin()

    superAdminsRepository.items.push(superAdmin)

    const result = await sut.execute({
      id: superAdmin.id.toString(),
      role: 'EMPLOYEE',
    })

    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
