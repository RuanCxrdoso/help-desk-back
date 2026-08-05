import { InMemoryTechniciansRepository } from 'test/repositories/in-memory-technicians-repository'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { UpdateTechnicianUseCase } from '../update-technician'
import { makeTechnician } from 'test/factories/make-technician'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotFoundError } from '../../errors/not-found-error'

let usersRepository: InMemoryUsersRepository
let techniciansRepository: InMemoryTechniciansRepository
let sut: UpdateTechnicianUseCase

describe('Update Technician', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    techniciansRepository = new InMemoryTechniciansRepository(usersRepository)
    sut = new UpdateTechnicianUseCase(techniciansRepository)

    for (let i = 1; i <= 2; i++) {
      techniciansRepository.items.push(
        makeTechnician(
          {
            tenantId: new UniqueEntityID(`tenant-id-${i}`),
            firstName: `Technician-${i}`,
            lastName: `lastName-${i}`,
            supportLevel: i,
            specialties: [`specialty-${i}`],
          },
          new UniqueEntityID(`id-${i}`),
        ),
      )
    }
  })

  it('should be able to update an technician', async () => {
    const result = await sut.execute({
      id: 'id-1',
      tenantId: 'tenant-id-1',
      firstName: 'updated-first-name',
      lastName: 'updated-last-name',
      supportLevel: 3,
      specialties: ['updated-specialty-1'],
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.technician).toEqual(
        expect.objectContaining({
          firstName: 'updated-first-name',
          lastName: 'updated-last-name',
          supportLevel: 3,
          specialties: ['updated-specialty-1'],
        }),
      )
      expect(techniciansRepository.items[0]).toEqual(
        expect.objectContaining({
          firstName: 'updated-first-name',
          lastName: 'updated-last-name',
          supportLevel: 3,
          specialties: ['updated-specialty-1'],
        }),
      )
    }
  })

  it('should not be able to update a non-existent technician', async () => {
    const result = await sut.execute({
      id: 'id-3',
      tenantId: 'tenant-id-3',
      firstName: 'updated-first-name',
      lastName: 'updated-last-name',
      supportLevel: 3,
      specialties: ['updated-specialty-1'],
    })

    expect(result.isLeft()).toBe(true)

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotFoundError)
    }
  })

  it('should be able to update an technician maintaining the unchanged fields', async () => {
    const result = await sut.execute({
      id: 'id-1',
      tenantId: 'tenant-id-1',
      firstName: 'new-first-name',
      lastName: 'lastName-1',
      supportLevel: 1,
      specialties: ['specialty-1'],
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.technician).toEqual(
        expect.objectContaining({
          firstName: 'new-first-name',
          lastName: 'lastName-1',
          supportLevel: 1,
          specialties: ['specialty-1'],
        }),
      )
    }
  })
})
