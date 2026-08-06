import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { DeleteAdminUseCase } from '../delete-admin'
import { makeAdmin } from 'test/factories/make-admin'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '../../errors/not-found-error'

let usersRepository: InMemoryUsersRepository
let adminsRepository: InMemoryAdminsRepository
let sut: DeleteAdminUseCase

describe('Delete Admin', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    adminsRepository = new InMemoryAdminsRepository(usersRepository)
    sut = new DeleteAdminUseCase(adminsRepository)

    const admin = makeAdmin(
      {
        tenantId: new UniqueEntityID('tenant-1'),
        isActive: true,
      },
      new UniqueEntityID('admin-1'),
    )

    adminsRepository.items.push(admin)
  })

  it('should be able to soft delete an admin', async () => {
    const result = await sut.execute({
      id: 'admin-1',
      tenantId: 'tenant-1',
    })

    expect(result.isRight()).toBe(true)

    expect(adminsRepository.items[0].isActive).toBe(false)
    expect(adminsRepository.items[0].deletedAt).toBeInstanceOf(Date)
  })

  it('should not be able to delete a non-existent admin', async () => {
    const result = await sut.execute({
      id: 'invalid-id',
      tenantId: 'tenant-1',
    })

    expect(result.isLeft()).toBe(true)

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotFoundError)
    }
  })

  it('should not be able to delete an admin from another tenant', async () => {
    const result = await sut.execute({
      id: 'admin-1',
      tenantId: 'tenant-2',
    })

    expect(result.isLeft()).toBe(true)

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotFoundError)
    }
  })
})
