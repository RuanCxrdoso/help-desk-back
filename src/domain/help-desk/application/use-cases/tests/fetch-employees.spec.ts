import { InMemoryEmployeesRepository } from 'test/repositories/in-memory-employees-repository'
import { FetchEmployeesUseCase } from '../fetch-employees'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { Employee } from '@/domain/help-desk/enterprise/entities/employee'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { makeEmployee } from 'test/factories/make-employee'

let usersRepository: InMemoryUsersRepository
let employeesRepository: InMemoryEmployeesRepository
let sut: FetchEmployeesUseCase

describe('Fetch employees', () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository()
    employeesRepository = new InMemoryEmployeesRepository(usersRepository)
    sut = new FetchEmployeesUseCase(employeesRepository)

    for (let i = 1; i <= 25; i++) {
      const isTargetTenant = i <= 20

      const employee = Employee.create(
        {
          tenantId: new UniqueEntityID(
            isTargetTenant ? 'tenant-1' : 'tenant-2',
          ),
          firstName:
            i === 5 ? 'Zack' : `Employee ${i.toString().padStart(2, '0')}`,
          lastName: i % 2 === 0 ? 'Silva' : 'Santos',
          email: EmailValueObject.create(`employee${i}@example.com`),
          password: 'hashed-password',
          department: 'Management',
          jobTitle: 'Employee',
          location: '4th floor',
          isActive: true,
        },
        new UniqueEntityID(`employee-${i}`),
      )

      employeesRepository.items.push(employee)
    }
  })

  it('should be able to fetch all employees for a specific tenant', async () => {
    const result = await sut.execute({
      tenantId: 'tenant-2',
      callerRole: 'EMPLOYEE',
      params: { page: 1, perPage: 10, orderBy: 'firstName', order: 'asc' },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.employees).toHaveLength(5)

      expect(result.value.employees[0].tenantId).toEqual('tenant-2')

      expect(result.value.meta).toEqual(
        expect.objectContaining({
          totalCount: 5,
          totalPages: 1,
          page: 1,
          perPage: 10,
        }),
      )
    }
  })

  it('should be able to paginate employees list', async () => {
    const result = await sut.execute({
      tenantId: 'tenant-1',
      callerRole: 'EMPLOYEE',
      params: {
        page: 3,
        perPage: 5,
        orderBy: 'firstName',
        order: 'asc',
      },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.employees).toHaveLength(5)

      expect(result.value.employees[0].firstName).toEqual('Employee 12')

      expect(result.value.meta).toEqual(
        expect.objectContaining({
          page: 3,
          perPage: 5,
          totalCount: 20,
          totalPages: 4,
          orderBy: 'firstName',
          order: 'asc',
        }),
      )
    }
  })

  it('should retrieve a empty list when search for a overflow page number', async () => {
    const result = await sut.execute({
      tenantId: 'tenant-1',
      callerRole: 'EMPLOYEE',
      params: {
        page: 100,
        perPage: 2,
        orderBy: 'firstName',
        order: 'asc',
      },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.employees).toHaveLength(0)
      expect(result.value.meta).toEqual(
        expect.objectContaining({
          page: 100,
          perPage: 2,
          totalCount: 20,
          totalPages: 10,
          orderBy: 'firstName',
          order: 'asc',
        }),
      )
    }
  })

  it('should be able to search an employee on list', async () => {
    const result = await sut.execute({
      tenantId: 'tenant-1',
      callerRole: 'EMPLOYEE',
      params: {
        q: 'Zack',
        page: 1,
        perPage: 10,
        orderBy: 'firstName',
        order: 'asc',
      },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.employees).toHaveLength(1)

      expect(result.value.meta).toEqual(
        expect.objectContaining({
          page: 1,
          perPage: 10,
          totalCount: 1,
          totalPages: 1,
          orderBy: 'firstName',
          order: 'asc',
        }),
      )
    }
  })

  it('should be able to order the list', async () => {
    const result = await sut.execute({
      tenantId: 'tenant-1',
      callerRole: 'EMPLOYEE',
      params: {
        page: 1,
        perPage: 10,
        orderBy: 'firstName',
        order: 'desc',
      },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.employees).toHaveLength(10)

      expect(result.value.employees[0].firstName).toEqual('Zack')

      expect(result.value.meta).toEqual(
        expect.objectContaining({
          page: 1,
          perPage: 10,
          totalCount: 20,
          totalPages: 2,
          orderBy: 'firstName',
          order: 'desc',
        }),
      )
    }
  })

  it('should return only active records by default when no status is provided', async () => {
    const inactiveEmployee = makeEmployee({
      tenantId: new UniqueEntityID('tenant-1'),
      isActive: false,
    })

    employeesRepository.items.push(inactiveEmployee)

    const result = await sut.execute({
      tenantId: 'tenant-1',
      callerRole: 'EMPLOYEE',
      params: { page: 1, perPage: 10 },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      const containsInactive = result.value.employees.some(
        (t) => t.isActive === false,
      )
      expect(containsInactive).toBe(false)
    }
  })

  it('should allow an ADMIN to fetch ALL records, including inactive ones', async () => {
    const inactiveEmployee = makeEmployee({
      tenantId: new UniqueEntityID('tenant-1'),
      isActive: false,
    })

    employeesRepository.items.push(inactiveEmployee)

    const result = await sut.execute({
      tenantId: 'tenant-1',
      callerRole: 'ADMIN',
      params: {
        page: 1,
        perPage: 30,
        status: 'ALL',
      },
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const containsInactive = result.value.employees.some((t) =>
        t.id.equals(inactiveEmployee.id),
      )
      expect(containsInactive).toBe(true)
    }
  })

  it('should force ACTIVE filter if caller is an EMPLOYEE, ignoring the ALL status parameter', async () => {
    const inactiveEmployee = makeEmployee({
      tenantId: new UniqueEntityID('tenant-1'),
      isActive: false,
    })

    employeesRepository.items.push(inactiveEmployee)

    const result = await sut.execute({
      tenantId: 'tenant-1',
      callerRole: 'EMPLOYEE',
      params: {
        page: 1,
        perPage: 30,
        status: 'ALL',
      },
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const containsInactive = result.value.employees.some(
        (t) => t.isActive === false,
      )
      expect(containsInactive).toBe(false)
    }
  })
})
