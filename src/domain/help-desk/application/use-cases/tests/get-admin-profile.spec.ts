import { makeAdmin } from 'test/factories/make-admin'
import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { GetAdminProfileUseCase } from '../get-admin-profile'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { NotFoundError } from '../../errors/not-found-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { FakeAuthorizationService } from 'test/services/authorization-service'
import { ROLE } from '@/core/enums/role'
import { NotAllowedError } from '../../errors/not-allowed-error'

let authorizationService: FakeAuthorizationService
let usersRepository: InMemoryUsersRepository
let adminsRepository: InMemoryAdminsRepository
let sut: GetAdminProfileUseCase

describe('Get Admin Profile', () => {
  beforeEach(() => {
    authorizationService = new FakeAuthorizationService()
    usersRepository = new InMemoryUsersRepository()
    adminsRepository = new InMemoryAdminsRepository(usersRepository)
    sut = new GetAdminProfileUseCase(adminsRepository, authorizationService)
  })

  it('should be able to get their profile', async () => {
    const admin = makeAdmin({
      firstName: 'Lewis Hamilton',
    })

    adminsRepository.items.push(admin)

    const result = await sut.execute({
      id: admin.id.toString(),
      tenantId: admin.tenantId.toString(),
      callerPayload: {
        sub: 'user-1',
        tenantId: 'tenant-1',
        role: ROLE.ADMIN,
      },
    })
    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual({
      admin: expect.objectContaining({
        firstName: 'Lewis Hamilton',
      }),
    })

    expect(authorizationService.authorizeSpy).toHaveBeenCalledWith(
      {
        sub: 'user-1',
        tenantId: 'tenant-1',
        role: ROLE.ADMIN,
      },
      'read',
      'User',
      expect.anything(),
    )
  })

  it('should not be able to get an inexistent employee profile', async () => {
    const result = await sut.execute({
      id: 'invalid-id',
      tenantId: 'tenant-1',
      callerPayload: {
        sub: 'user-1',
        tenantId: 'tenant-1',
        role: ROLE.ADMIN,
      },
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should not be able to get a profile from another tenant', async () => {
    const employee = makeAdmin({
      tenantId: new UniqueEntityID('tenant-1'),
    })

    adminsRepository.items.push(employee)

    const result = await sut.execute({
      id: employee.id.toString(),
      tenantId: 'tenant-2', // Simula a requisição originada de um tenant diferente
      callerPayload: {
        sub: 'user-1',
        tenantId: 'tenant-1',
        role: ROLE.ADMIN,
      },
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should not be able to get a profile if not authorized', async () => {
    const admin = makeAdmin(
      { tenantId: new UniqueEntityID('tenant-1') },
      new UniqueEntityID('admin-1'),
    )

    adminsRepository.items.push(admin)

    authorizationService.mockAuthorization(false)

    const result = await sut.execute({
      id: 'admin-1',
      tenantId: 'tenant-1',
      callerPayload: {
        sub: 'user-1',
        tenantId: 'tenant-1',
        role: ROLE.ADMIN,
      },
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
