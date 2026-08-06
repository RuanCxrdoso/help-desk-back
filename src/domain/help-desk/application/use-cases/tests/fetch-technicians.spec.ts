import { InMemoryTechniciansRepository } from 'test/repositories/in-memory-technicians-repository'
import { FetchTechniciansUseCase } from '../fetch-technicians'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { Technician } from '@/domain/help-desk/enterprise/entities/technician'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { makeTechnician } from 'test/factories/make-technician'

let usersRepository: InMemoryUsersRepository
let techniciansRepository: InMemoryTechniciansRepository
let sut: FetchTechniciansUseCase

describe('Fetch technicians', () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository()
    techniciansRepository = new InMemoryTechniciansRepository(usersRepository)
    sut = new FetchTechniciansUseCase(techniciansRepository)

    for (let i = 1; i <= 25; i++) {
      const isTargetTenant = i <= 20

      const technician = Technician.create(
        {
          tenantId: new UniqueEntityID(
            isTargetTenant ? 'tenant-1' : 'tenant-2',
          ),
          firstName:
            i === 5 ? 'Zack' : `Technician ${i.toString().padStart(2, '0')}`,
          lastName: i % 2 === 0 ? 'Silva' : 'Santos',
          email: EmailValueObject.create(`technician${i}@example.com`),
          password: 'hashed-password',
          supportLevel: i,
          specialties: ['Cybersecurity', 'Infrastructure'],
          isActive: true,
        },
        new UniqueEntityID(`technician-${i}`),
      )

      techniciansRepository.items.push(technician)
    }
  })

  it('should be able to fetch all technicians for a specific tenant', async () => {
    const result = await sut.execute({
      tenantId: 'tenant-2',
      callerRole: 'TECHNICIAN',
      params: { page: 1, perPage: 10, orderBy: 'firstName', order: 'asc' },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.technicians).toHaveLength(5)

      expect(result.value.technicians[0].tenantId).toEqual('tenant-2')

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

  it('should be able to paginate technicians list', async () => {
    const result = await sut.execute({
      tenantId: 'tenant-1',
      callerRole: 'TECHNICIAN',
      params: {
        page: 3,
        perPage: 5,
        orderBy: 'firstName',
        order: 'asc',
      },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.technicians).toHaveLength(5)

      expect(result.value.technicians[0].firstName).toEqual('Technician 12')

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
      callerRole: 'TECHNICIAN',
      params: {
        page: 100,
        perPage: 2,
        orderBy: 'firstName',
        order: 'asc',
      },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.technicians).toHaveLength(0)
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

  it('should be able to search an technician on list', async () => {
    const result = await sut.execute({
      tenantId: 'tenant-1',
      callerRole: 'TECHNICIAN',
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
      expect(result.value.technicians).toHaveLength(1)

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
      callerRole: 'TECHNICIAN',
      params: {
        page: 1,
        perPage: 10,
        orderBy: 'firstName',
        order: 'desc',
      },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.technicians).toHaveLength(10)

      expect(result.value.technicians[0].firstName).toEqual('Zack')

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
    const inactiveTechnician = makeTechnician({
      tenantId: new UniqueEntityID('tenant-1'),
      isActive: false,
    })

    techniciansRepository.items.push(inactiveTechnician)

    const result = await sut.execute({
      tenantId: 'tenant-1',
      callerRole: 'TECHNICIAN',
      params: { page: 1, perPage: 10 },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      const containsInactive = result.value.technicians.some(
        (t) => t.isActive === false,
      )
      expect(containsInactive).toBe(false)
    }
  })

  it('should allow an ADMIN to fetch ALL records, including inactive ones', async () => {
    const inactiveTechnician = makeTechnician({
      tenantId: new UniqueEntityID('tenant-1'),
      isActive: false,
    })

    techniciansRepository.items.push(inactiveTechnician)

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
      const containsInactive = result.value.technicians.some((t) =>
        t.id.equals(inactiveTechnician.id),
      )
      expect(containsInactive).toBe(true)
    }
  })

  it('should force ACTIVE filter if caller is an EMPLOYEE, ignoring the ALL status parameter', async () => {
    const inactiveTechnician = makeTechnician({
      tenantId: new UniqueEntityID('tenant-1'),
      isActive: false,
    })

    techniciansRepository.items.push(inactiveTechnician)

    const result = await sut.execute({
      tenantId: 'tenant-1',
      callerRole: 'EMPLOYEE',
      params: {
        page: 1,
        perPage: 10,
        status: 'ALL',
      },
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const containsInactive = result.value.technicians.some(
        (t) => t.isActive === false,
      )
      expect(containsInactive).toBe(false)
    }
  })
})
