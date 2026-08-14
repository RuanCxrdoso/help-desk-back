import { makeEmployee } from 'test/factories/make-employee'
import { InMemoryEmployeesRepository } from 'test/repositories/in-memory-employees-repository'
import { GetEmployeeProfileUseCase } from '../get-employee-profile'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { NotFoundError } from '../../errors/not-found-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { FakeAuthorizationService } from 'test/services/authorization-service'
import { ROLE } from '@/core/enums/role'
import { NotAllowedError } from '../../errors/not-allowed-error'

let authorizationService: FakeAuthorizationService
let usersRepository: InMemoryUsersRepository
let employeesRepository: InMemoryEmployeesRepository
let sut: GetEmployeeProfileUseCase

describe('Get Employee Profile', () => {
  beforeEach(() => {
    authorizationService = new FakeAuthorizationService()
    usersRepository = new InMemoryUsersRepository()
    employeesRepository = new InMemoryEmployeesRepository(usersRepository)
    sut = new GetEmployeeProfileUseCase(
      employeesRepository,
      authorizationService,
    )
  })

  it('should be able to get their profile', async () => {
    const employee = makeEmployee({
      firstName: 'Lebron James',
    })

    employeesRepository.items.push(employee)

    const result = await sut.execute({
      id: employee.id.toString(),
      tenantId: employee.tenantId.toString(),
      callerPayload: {
        sub: employee.id.toString(),
        role: employee.role,
        tenantId: employee.tenantId.toString(),
      },
    })
    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual({
      employee: expect.objectContaining({
        firstName: 'Lebron James',
      }),
    })

    expect(authorizationService.authorizeSpy).toHaveBeenCalledWith(
      {
        sub: employee.id.toString(),
        role: employee.role,
        tenantId: employee.tenantId.toString(),
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
    const employee = makeEmployee({
      tenantId: new UniqueEntityID('tenant-1'),
    })

    employeesRepository.items.push(employee)

    const result = await sut.execute({
      id: employee.id.toString(),
      tenantId: 'tenant-2',
      callerPayload: {
        sub: 'user-1',
        tenantId: 'tenant-1',
        role: ROLE.ADMIN,
      },
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotFoundError)
  })

  it('should not be able to get a profile if the user is not authorized', async () => {
    const employee = makeEmployee({
      firstName: 'Lebron James',
    })

    employeesRepository.items.push(employee)

    authorizationService.mockAuthorization(false)

    const result = await sut.execute({
      id: employee.id.toString(),
      tenantId: employee.tenantId.toString(),
      callerPayload: {
        sub: 'user-1',
        tenantId: employee.tenantId.toString(),
        role: ROLE.ADMIN,
      },
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
