import { makeTechnician } from 'test/factories/make-technician'
import { InMemoryTechniciansRepository } from 'test/repositories/in-memory-technicians-repository'
import { GetTechnicianProfileUseCase } from '../get-technician-profile'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { NotFoundError } from '../../errors/not-found-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let usersRepository: InMemoryUsersRepository
let techniciansRepository: InMemoryTechniciansRepository
let sut: GetTechnicianProfileUseCase

describe('Get Technician Profile', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    techniciansRepository = new InMemoryTechniciansRepository(usersRepository)
    sut = new GetTechnicianProfileUseCase(techniciansRepository)
  })

  it('should be able to get their profile', async () => {
    const technician = makeTechnician({
      firstName: 'Lewis Hamilton',
    })

    techniciansRepository.items.push(technician)

    const result = await sut.execute({
      id: technician.id.toString(),
      tenantId: technician.tenantId.toString(),
    })
    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual({
      technician: expect.objectContaining({
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
    const employee = makeTechnician({
      tenantId: new UniqueEntityID('tenant-1'),
    })

    techniciansRepository.items.push(employee)

    const result = await sut.execute({
      id: employee.id.toString(),
      tenantId: 'tenant-2', // Simula a requisição originada de um tenant diferente
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotFoundError)
  })
})
