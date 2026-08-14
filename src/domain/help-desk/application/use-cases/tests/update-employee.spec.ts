import { InMemoryEmployeesRepository } from 'test/repositories/in-memory-employees-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { UpdateEmployeeUseCase } from '../update-employee'
import { makeEmployee } from 'test/factories/make-employee'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '../../errors/not-found-error'
import { FakeAuthorizationService } from 'test/services/authorization-service'
import { ROLE } from '@/core/enums/role'
import { NotAllowedError } from '../../errors/not-allowed-error'

let authorizationService: FakeAuthorizationService
let usersRepository: InMemoryUsersRepository
let employeesRepository: InMemoryEmployeesRepository
let sut: UpdateEmployeeUseCase

describe('Update Employee', () => {
  beforeEach(() => {
    authorizationService = new FakeAuthorizationService()
    usersRepository = new InMemoryUsersRepository()
    employeesRepository = new InMemoryEmployeesRepository(usersRepository)
    sut = new UpdateEmployeeUseCase(employeesRepository, authorizationService)

    for (let i = 1; i <= 2; i++) {
      employeesRepository.items.push(
        makeEmployee(
          {
            tenantId: new UniqueEntityID(`tenant-id-${i}`),
            firstName: `Employee-${i}`,
            lastName: `lastName-${i}`,
            department: `department-${i}`,
            jobTitle: `jobTitle-${i}`,
            location: `location-${i}`,
          },
          new UniqueEntityID(`id-${i}`),
        ),
      )
    }
  })

  it('should be able to update a employee', async () => {
    const result = await sut.execute({
      id: 'id-1',
      tenantId: 'tenant-id-1',
      firstName: 'updated-first-name',
      lastName: 'updated-last-name',
      department: 'updated-department',
      jobTitle: 'updated-job-title',
      location: 'updated-location',
      callerPayload: {
        sub: 'user-id',
        tenantId: 'tenant-id-1',
        role: ROLE.ADMIN,
      },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.employee).toEqual(
        expect.objectContaining({
          firstName: 'updated-first-name',
          lastName: 'updated-last-name',
          department: 'updated-department',
          jobTitle: 'updated-job-title',
          location: 'updated-location',
        }),
      )

      expect(employeesRepository.items[0]).toEqual(
        expect.objectContaining({
          firstName: 'updated-first-name',
          lastName: 'updated-last-name',
          department: 'updated-department',
          jobTitle: 'updated-job-title',
          location: 'updated-location',
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

  it('should not be able to update a non-existent employee', async () => {
    const result = await sut.execute({
      id: 'id-3',
      tenantId: 'tenant-id-3',
      firstName: 'updated-first-name',
      lastName: 'updated-last-name',
      department: 'updated-department',
      jobTitle: 'updated-job-title',
      location: 'updated-location',
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

  it('should be able to update a employee maintaining the unchanged fields', async () => {
    const result = await sut.execute({
      id: 'id-1',
      tenantId: 'tenant-id-1',
      firstName: 'new-first-name',
      lastName: 'lastName-1',
      department: 'department-1',
      jobTitle: 'jobTitle-1',
      location: 'location-1',
      callerPayload: {
        sub: 'user-id',
        tenantId: 'tenant-id-1',
        role: ROLE.ADMIN,
      },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.employee).toEqual(
        expect.objectContaining({
          firstName: 'new-first-name',
          lastName: 'lastName-1',
          department: 'department-1',
          jobTitle: 'jobTitle-1',
          location: 'location-1',
        }),
      )
    }
  })

  it('should not be able to update an employee if not authorized', async () => {
    authorizationService.mockAuthorization(false)

    const result = await sut.execute({
      id: 'id-1',
      tenantId: 'tenant-id-1',
      firstName: 'updated-first-name',
      lastName: 'updated-last-name',
      department: 'updated-department',
      jobTitle: 'updated-job-title',
      location: 'updated-location',
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

    expect(employeesRepository.items[0]).toEqual(
      expect.objectContaining({
        firstName: 'Employee-1',
        lastName: 'lastName-1',
      }),
    )
  })
})
