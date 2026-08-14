import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { FetchAdminsUseCase } from '../fetch-admins'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { Admin } from '@/domain/help-desk/enterprise/entities/admin'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EmailValueObject } from '@/domain/help-desk/enterprise/entities/value-objects/email-value-object'
import { makeAdmin } from 'test/factories/make-admin'

let usersRepository: InMemoryUsersRepository
let adminsRepository: InMemoryAdminsRepository
let sut: FetchAdminsUseCase

describe('Fetch admins', () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository()
    adminsRepository = new InMemoryAdminsRepository(usersRepository)
    sut = new FetchAdminsUseCase(adminsRepository)

    for (let i = 1; i <= 25; i++) {
      const isTargetTenant = i <= 20

      const admin = Admin.create(
        {
          tenantId: new UniqueEntityID(
            isTargetTenant ? 'tenant-1' : 'tenant-2',
          ),
          firstName:
            i === 5 ? 'Zack' : `Admin ${i.toString().padStart(2, '0')}`,
          lastName: i % 2 === 0 ? 'Silva' : 'Santos',
          email: EmailValueObject.create(`admin${i}@example.com`),
          password: 'hashed-password',
          department: 'Management',
          jobTitle: 'Administrator',
          isActive: true,
        },
        new UniqueEntityID(`admin-${i}`),
      )

      adminsRepository.items.push(admin)
    }
  })

  it('should be able to fetch all admins for a specific tenant', async () => {
    const result = await sut.execute({
      tenantId: 'tenant-2',
      callerRole: 'ADMIN',
      params: { page: 1, perPage: 10, orderBy: 'firstName', order: 'asc' },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.admins).toHaveLength(5)

      expect(result.value.admins[0].tenantId).toEqual('tenant-2')

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

  it('should be able to paginate admins list', async () => {
    const result = await sut.execute({
      tenantId: 'tenant-1',
      callerRole: 'ADMIN',
      params: {
        page: 3,
        perPage: 5,
        orderBy: 'firstName',
        order: 'asc',
      },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.admins).toHaveLength(5)

      expect(result.value.admins[0].firstName).toEqual('Admin 12')

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
      callerRole: 'ADMIN',
      params: {
        page: 100,
        perPage: 2,
        orderBy: 'firstName',
        order: 'asc',
      },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.admins).toHaveLength(0)
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

  it('should be able to search an admin on list', async () => {
    const result = await sut.execute({
      tenantId: 'tenant-1',
      callerRole: 'ADMIN',
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
      expect(result.value.admins).toHaveLength(1)

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
      callerRole: 'ADMIN',
      params: {
        page: 1,
        perPage: 10,
        orderBy: 'firstName',
        order: 'desc',
      },
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.admins).toHaveLength(10)

      expect(result.value.admins[0].firstName).toEqual('Zack')

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
    const inactiveAdmin = makeAdmin({
      tenantId: new UniqueEntityID('tenant-1'),
      isActive: false,
    })
    adminsRepository.items.push(inactiveAdmin)

    const result = await sut.execute({
      tenantId: 'tenant-1',
      callerRole: 'ADMIN',
      params: { page: 1, perPage: 30 },
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const containsInactive = result.value.admins.some(
        (t) => t.isActive === false,
      )
      expect(containsInactive).toBe(false)
    }
  })

  it('should allow an ADMIN to fetch ALL records, including inactive ones', async () => {
    const inactiveAdmin = makeAdmin({
      tenantId: new UniqueEntityID('tenant-1'),
      isActive: false,
    })

    adminsRepository.items.push(inactiveAdmin)

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
      const containsInactive = result.value.admins.some((t) =>
        t.id.equals(inactiveAdmin.id),
      )
      expect(containsInactive).toBe(true)
    }
  })

  it('should force ACTIVE filter if caller is an EMPLOYEE, ignoring the ALL status parameter', async () => {
    const inactiveAdmin = makeAdmin({
      tenantId: new UniqueEntityID('tenant-1'),
      isActive: false,
    })
    adminsRepository.items.push(inactiveAdmin)

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
      const containsInactive = result.value.admins.some(
        (t) => t.isActive === false,
      )
      expect(containsInactive).toBe(false)
    }
  })
})
