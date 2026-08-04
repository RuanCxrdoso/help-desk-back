import { makeAdmin } from 'test/factories/make-admin'
import { InMemoryAdminsRepository } from 'test/repositories/in-memory-admins-repository'
import { GetAdminProfileUseCase } from '../get-admin-profile'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { NotFoundError } from '../../errors/not-found-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let usersRepository: InMemoryUsersRepository
let adminsRepository: InMemoryAdminsRepository
let sut: GetAdminProfileUseCase

describe('Get Admin Profile', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    adminsRepository = new InMemoryAdminsRepository(usersRepository)
    sut = new GetAdminProfileUseCase(adminsRepository)
  })

  it('should be able to get their profile', async () => {
    const admin = makeAdmin({
      firstName: 'Lewis Hamilton',
    })

    adminsRepository.items.push(admin)

    const result = await sut.execute({
      id: admin.id.toString(),
      tenantId: admin.tenantId.toString(),
    })
    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual({
      admin: expect.objectContaining({
        firstName: 'Lewis Hamilton',
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
    const employee = makeAdmin({
      tenantId: new UniqueEntityID('tenant-1'),
    })

    adminsRepository.items.push(employee)

    const result = await sut.execute({
      id: employee.id.toString(),
      tenantId: 'tenant-2', // Simula a requisição originada de um tenant diferente
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotFoundError)
  })
})
