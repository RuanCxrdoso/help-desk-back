import { IAdminsRepository } from '../repositories/admins-repository'
import { Either, left, right } from '@/core/error/either'
import { NotFoundError } from '../errors/not-found-error'
import { Admin } from '../../enterprise/entities/admin'
import { Injectable } from '@nestjs/common'

interface GetAdminProfileUseCaseRequest {
  id: string
  tenantId: string
}

type GetAdminProfileUseCaseResponse = Either<NotFoundError, { admin: Admin }>

@Injectable()
export class GetAdminProfileUseCase {
  constructor(private adminsRepository: IAdminsRepository) {}

  async execute({
    id,
    tenantId,
  }: GetAdminProfileUseCaseRequest): Promise<GetAdminProfileUseCaseResponse> {
    const admin = await this.adminsRepository.findById(id, tenantId)

    if (!admin) {
      return left(new NotFoundError())
    }

    return right({ admin })
  }
}
