import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { UpdateAdminUseCase } from '../update-admin'
import { makeAdmin } from 'test/factories/make-admin'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '../../errors/not-found-error'

let usersRepository: InMemoryUsersRepository
let adminsRepository: InMemoryAdminsRepository
let sut: UpdateAdminUseCase

describe('Update Admin', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    adminsRepository = new InMemoryAdminsRepository(usersRepository)
    sut = new UpdateAdminUseCase(adminsRepository)

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

  it('should be able to update an admin', async () => {
    const result = await sut.execute({
      id: 'id-1',
      tenantId: 'tenant-id-1',
      firstName: 'updated-first-name',
      lastName: 'updated-last-name',
      department: 'updated-department',
      jobTitle: 'updated-job-title',
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
  })

  it('should not be able to update a non-existent admin', async () => {
    const result = await sut.execute({
      id: 'id-3',
      tenantId: 'tenant-id-3',
      firstName: 'updated-first-name',
      lastName: 'updated-last-name',
      department: 'updated-department',
      jobTitle: 'updated-job-title',
    })

    expect(result.isLeft()).toBe(true)

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotFoundError)
    }
  })

  it('should be able to update an admin maintaining the unchanged fields', async () => {
    const result = await sut.execute({
      id: 'id-1',
      tenantId: 'tenant-id-1',
      firstName: 'new-first-name',
      lastName: 'lastName-1',
      department: 'department-1',
      jobTitle: 'jobTitle-1',
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
})
