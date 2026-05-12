import { makeEmployee } from 'test/factories/make-employee'
import { InMemoryEmployeesRepository } from 'test/repositories/in-memory-employees-repository'
import { GetEmployeeProfileUseCase } from '../get-employee-profile'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'

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
      role: employee.role,
    })
    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual({
      employee: expect.objectContaining({
        firstName: 'Lebron James',
      }),
    })
  })

  it('shouldn`t be able to get profile with wrong role', async () => {
    const employee = makeEmployee({
      firstName: 'Steph Curry',
    })

    employeesRepository.items.push(employee)

    const result = await sut.execute({
      id: employee.id.toString(),
      tenantId: employee.tenantId.toString(),
      role: 'TECHNICIAN',
    })

    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
