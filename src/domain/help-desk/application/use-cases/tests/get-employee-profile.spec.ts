import { makeEmployee } from 'test/factories/make-employee'
import { InMemoryEmployeesRepository } from 'test/repositories/in-memory-employees-repository'
import { GetEmployeeProfileUseCase } from '../get-employee-profile'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { NotFoundError } from '../../errors/not-found-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let usersRepository: InMemoryUsersRepository
let employeesRepository: InMemoryEmployeesRepository
let sut: GetEmployeeProfileUseCase

describe('Get Employee Profile', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    employeesRepository = new InMemoryEmployeesRepository(usersRepository)
    sut = new GetEmployeeProfileUseCase(employeesRepository)
  })

  it('should be able to get their profile', async () => {
    const employee = makeEmployee({
      firstName: 'Lebron James',
    })

    employeesRepository.items.push(employee)

    const result = await sut.execute({
      id: employee.id.toString(),
      tenantId: employee.tenantId.toString(),
    })
    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual({
      employee: expect.objectContaining({
        firstName: 'Lebron James',
      }),
    })
  })

  it('should not be able to get an inexistent employee profile', async () => {
    const result = await sut.execute({
      id: 'invalid-id',
      tenantId: 'tenant-1',
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
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotFoundError)
  })
})
