import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { UpdateAdminUseCase } from '../update-admin'
import { makeAdmin } from 'test/factories/make-admin'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '../../errors/not-found-error'
import { FakeAuthorizationService } from 'test/services/authorization-service'
import { ROLE } from '@/core/enums/role'
import { NotAllowedError } from '../../errors/not-allowed-error'

let authorizationService: FakeAuthorizationService
let usersRepository: InMemoryUsersRepository
let adminsRepository: InMemoryAdminsRepository
let sut: UpdateAdminUseCase

describe('Update Admin', () => {
  beforeEach(() => {
    authorizationService = new FakeAuthorizationService()
    usersRepository = new InMemoryUsersRepository()
    adminsRepository = new InMemoryAdminsRepository(usersRepository)
    sut = new UpdateAdminUseCase(adminsRepository, authorizationService)

    for (let i = 1; i <= 2; i++) {
      adminsRepository.items.push(
        makeAdmin(
          {
            tenantId: new UniqueEntityID(`tenant-id-${i}`),
            firstName: `Admin-${i}`,
            lastName: `lastName-${i}`,
            department: `department-${i}`,
            jobTitle: `jobTitle-${i}`,
          },
          new UniqueEntityID(`id-${i}`),
        ),
      )
    }
  })

  it('should be able to update a admin', async () => {
    const result = await sut.execute({
      id: 'id-1',
      tenantId: 'tenant-id-1',
      firstName: 'updated-first-name',
      lastName: 'updated-last-name',
      department: 'updated-department',
      jobTitle: 'updated-job-title',
      callerPayload: {
        sub: 'user-id',
        tenantId: 'tenant-id-1',
        role: ROLE.ADMIN,
      },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.admin).toEqual(
        expect.objectContaining({
          firstName: 'updated-first-name',
          lastName: 'updated-last-name',
          department: 'updated-department',
          jobTitle: 'updated-job-title',
        }),
      )

      expect(adminsRepository.items[0]).toEqual(
        expect.objectContaining({
          firstName: 'updated-first-name',
          lastName: 'updated-last-name',
          department: 'updated-department',
          jobTitle: 'updated-job-title',
        }),
      )
    }

    expect(authorizationService.authorizeSpy).toHaveBeenCalledWith(
      {
        sub: 'user-id',
        tenantId: 'tenant-id-1',
        role: ROLE.ADMIN,
      },
      'update',
      'User',
      expect.anything(),
    )
  })

  it('should not be able to update a non-existent admin', async () => {
    const result = await sut.execute({
      id: 'id-3',
      tenantId: 'tenant-id-3',
      firstName: 'updated-first-name',
      lastName: 'updated-last-name',
      department: 'updated-department',
      jobTitle: 'updated-job-title',
      callerPayload: {
        sub: 'user-id',
        tenantId: 'tenant-id-3',
        role: ROLE.ADMIN,
      },
    })

    expect(result.isLeft()).toBe(true)

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotFoundError)
    }
  })

  it('should be able to update a admin maintaining the unchanged fields', async () => {
    const result = await sut.execute({
      id: 'id-1',
      tenantId: 'tenant-id-1',
      firstName: 'new-first-name',
      lastName: 'lastName-1',
      department: 'department-1',
      jobTitle: 'jobTitle-1',
      callerPayload: {
        sub: 'user-id',
        tenantId: 'tenant-id-1',
        role: ROLE.ADMIN,
      },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.admin).toEqual(
        expect.objectContaining({
          firstName: 'new-first-name',
          lastName: 'lastName-1',
          department: 'department-1',
          jobTitle: 'jobTitle-1',
        }),
      )
    }
  })

  it('should not be able to update an admin if not authorized', async () => {
    authorizationService.mockAuthorization(false)

    const result = await sut.execute({
      id: 'id-1',
      tenantId: 'tenant-id-1',
      firstName: 'updated-first-name',
      lastName: 'updated-last-name',
      department: 'updated-department',
      jobTitle: 'updated-job-title',
      callerPayload: {
        sub: 'user-id',
        tenantId: 'tenant-id-1',
        role: ROLE.ADMIN,
      },
    })

    expect(result.isLeft()).toBe(true)

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError)
    }

    expect(adminsRepository.items[0]).toEqual(
      expect.objectContaining({
        firstName: 'Admin-1',
        lastName: 'lastName-1',
      }),
    )
  })
})
