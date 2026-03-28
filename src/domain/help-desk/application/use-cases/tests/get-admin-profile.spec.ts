import { makeAdmin } from 'test/factories/make-admin'
import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { GetAdminProfileUseCase } from '../get-admin-profile'
import { NotAllowedError } from '../../errors/not-allowed-error'

let adminsRepository: InMemoryAdminsRepository
let sut: GetAdminProfileUseCase

describe('Get Admin Profile', () => {
  beforeEach(() => {
    adminsRepository = new InMemoryAdminsRepository()
    sut = new GetAdminProfileUseCase(adminsRepository)
  })

  it('should be able to get their profile', async () => {
    const admin = makeAdmin({
      firstName: 'Lewis Hamilton',
    })

    adminsRepository.items.push(admin)

    const result = await sut.execute({
      id: admin.id.toString(),
      tenantId: admin.tenantId.toString(),
      role: admin.role,
    })
    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual({
      admin: expect.objectContaining({
        firstName: 'Lewis Hamilton',
      }),
    })
  })

  it('shouldn`t be able to get profile with wrong role', async () => {
    const admin = makeAdmin()

    adminsRepository.items.push(admin)

    const result = await sut.execute({
      id: admin.id.toString(),
      tenantId: admin.tenantId.toString(),
      role: 'EMPLOYEE',
    })

    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
