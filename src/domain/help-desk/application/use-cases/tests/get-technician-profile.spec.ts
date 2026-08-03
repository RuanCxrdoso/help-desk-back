import { makeTechnician } from 'test/factories/make-technician'
import { InMemoryTechniciansRepository } from 'test/repositories/in-memory-technicians-repository'
import { GetTechnicianProfileUseCase } from '../get-technician-profile'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'

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
})
