import { makeTechnician } from 'test/factories/make-technician'
import { InMemoryTechniciansRepository } from 'test/repositories/in-memory-technicians-repository'
import { GetTechnicianProfileUseCase } from '../get-technician-profile'
import { NotAllowedError } from '../../errors/not-allowed-error'

let techniciansRepository: InMemoryTechniciansRepository
let sut: GetTechnicianProfileUseCase

describe('Get Technician Profile', () => {
  beforeEach(() => {
    techniciansRepository = new InMemoryTechniciansRepository()
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
      role: technician.role,
    })
    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual({
      technician: expect.objectContaining({
        firstName: 'Lewis Hamilton',
      }),
    })
  })

  it('shouldn`t be able to get profile with wrong role', async () => {
    const technician = makeTechnician()

    techniciansRepository.items.push(technician)

    const result = await sut.execute({
      id: technician.id.toString(),
      tenantId: technician.tenantId.toString(),
      role: 'EMPLOYEE',
    })

    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
