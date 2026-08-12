import { InMemoryTechniciansRepository } from 'test/repositories/in-memory-technicians-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { DeleteTechnicianUseCase } from '../delete-technician'
import { makeTechnician } from 'test/factories/make-technician'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '../../errors/not-found-error'
import { FakeAuthorizationService } from 'test/services/authorization-service'
import { ROLE } from '@/core/enums/role'
import { NotAllowedError } from '../../errors/not-allowed-error'

let authorizationService: FakeAuthorizationService
let usersRepository: InMemoryUsersRepository
let techniciansRepository: InMemoryTechniciansRepository
let sut: DeleteTechnicianUseCase

describe('Delete Technician', () => {
  beforeEach(() => {
    authorizationService = new FakeAuthorizationService()
    usersRepository = new InMemoryUsersRepository()
    techniciansRepository = new InMemoryTechniciansRepository(usersRepository)
    sut = new DeleteTechnicianUseCase(
      techniciansRepository,
      authorizationService,
    )

    const technician = makeTechnician(
      {
        tenantId: new UniqueEntityID('tenant-1'),
        isActive: true,
      },
      new UniqueEntityID('technician-1'),
    )

    techniciansRepository.items.push(technician)
  })

  it('should be able to soft delete an technician', async () => {
    const result = await sut.execute({
      id: 'technician-1',
      tenantId: 'tenant-1',
      callerPayload: {
        sub: 'user-1',
        tenantId: 'tenant-1',
        role: ROLE.ADMIN,
      },
    })

    expect(result.isRight()).toBe(true)

    expect(techniciansRepository.items[0].isActive).toBe(false)
    expect(techniciansRepository.items[0].deletedAt).toBeInstanceOf(Date)

    expect(authorizationService.authorizeSpy).toHaveBeenCalledWith(
      {
        sub: 'user-1',
        tenantId: 'tenant-1',
        role: ROLE.ADMIN,
      },
      'delete',
      'User',
      expect.anything(),
    )
  })

  it('should not be able to delete a non-existent technician', async () => {
    const result = await sut.execute({
      id: 'invalid-id',
      tenantId: 'tenant-1',
      callerPayload: {
        sub: 'user-1',
        tenantId: 'tenant-1',
        role: ROLE.ADMIN,
      },
    })

    expect(result.isLeft()).toBe(true)

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotFoundError)
    }
  })

  it('should not be able to delete an technician from another tenant', async () => {
    const result = await sut.execute({
      id: 'technician-1',
      tenantId: 'tenant-2',
      callerPayload: {
        sub: 'user-1',
        tenantId: 'tenant-2',
        role: ROLE.ADMIN,
      },
    })

    expect(result.isLeft()).toBe(true)

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotFoundError)
    }
  })

  it('should not be able to delete an technician if not authorized', async () => {
    authorizationService.mockAuthorization(false)

    const result = await sut.execute({
      id: 'technician-1',
      tenantId: 'tenant-1',
      callerPayload: {
        sub: 'user-1',
        tenantId: 'tenant-1',
        role: ROLE.ADMIN,
      },
    })

    expect(result.isLeft()).toBe(true)

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError)
    }

    expect(techniciansRepository.items[0].isActive).toBe(true)
  })
})
