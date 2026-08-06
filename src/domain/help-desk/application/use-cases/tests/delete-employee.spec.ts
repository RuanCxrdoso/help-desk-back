import { InMemoryEmployeesRepository } from 'test/repositories/in-memory-employees-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { DeleteEmployeeUseCase } from '../delete-employee'
import { makeEmployee } from 'test/factories/make-employee'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '../../errors/not-found-error'

let usersRepository: InMemoryUsersRepository
let employeesRepository: InMemoryEmployeesRepository
let sut: DeleteEmployeeUseCase

describe('Delete Employee', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    employeesRepository = new InMemoryEmployeesRepository(usersRepository)
    sut = new DeleteEmployeeUseCase(employeesRepository)

    const employee = makeEmployee(
      {
        tenantId: new UniqueEntityID('tenant-1'),
        isActive: true,
      },
      new UniqueEntityID('employee-1'),
    )

    employeesRepository.items.push(employee)
  })

  it('should be able to soft delete an employee', async () => {
    const result = await sut.execute({
      id: 'employee-1',
      tenantId: 'tenant-1',
    })

    expect(result.isRight()).toBe(true)

    expect(employeesRepository.items[0].isActive).toBe(false)
    expect(employeesRepository.items[0].deletedAt).toBeInstanceOf(Date)
  })

  it('should not be able to delete a non-existent employee', async () => {
    const result = await sut.execute({
      id: 'invalid-id',
      tenantId: 'tenant-1',
    })

    expect(result.isLeft()).toBe(true)

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotFoundError)
    }
  })

  it('should not be able to delete an employee from another tenant', async () => {
    const result = await sut.execute({
      id: 'employee-1',
      tenantId: 'tenant-2',
    })

    expect(result.isLeft()).toBe(true)

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotFoundError)
    }
  })
})
