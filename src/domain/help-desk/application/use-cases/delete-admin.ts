import { Either, right, left } from '@/core/error/either'
import { IAdminsRepository } from '../repositories/admins-repository'
import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../errors/not-found-error'

export interface DeleteAdminUseCaseRequest {
  id: string
  tenantId: string
}

type DeleteAdminUseCaseResponse = Either<NotFoundError, null>

@Injectable()
export class DeleteAdminUseCase {
  constructor(private readonly adminsRepository: IAdminsRepository) {}

  async execute({
    id,
    tenantId,
  }: DeleteAdminUseCaseRequest): Promise<DeleteAdminUseCaseResponse> {
    const admin = await this.adminsRepository.findById(id, tenantId)

    if (!admin) {
      return left(new NotFoundError())
    }

    admin.deactivate()

    await this.adminsRepository.save(admin)

    return right(null)
  }
}
