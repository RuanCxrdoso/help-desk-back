import { Either, right, left } from '@/core/error/either'
import { IAdminsRepository } from '../repositories/admins-repository'
import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../errors/not-found-error'
import { Admin } from '../../enterprise/entities/admin'

export interface UpdateAdminUseCaseRequest {
  id: string
  tenantId?: string
  firstName: string
  lastName: string
  department: string
  jobTitle: string
}

type UpdateAdminUseCaseResponse = Either<NotFoundError, { admin: Admin }>

@Injectable()
export class UpdateAdminUseCase {
  constructor(private readonly adminsRepository: IAdminsRepository) {}

  async execute({
    id,
    tenantId,
    firstName,
    lastName,
    department,
    jobTitle,
  }: UpdateAdminUseCaseRequest): Promise<UpdateAdminUseCaseResponse> {
    const admin = await this.adminsRepository.findById(id, tenantId)

    if (!admin) return left(new NotFoundError())

    admin.firstName = firstName
    admin.lastName = lastName
    admin.department = department
    admin.jobTitle = jobTitle

    await this.adminsRepository.save(admin)

    return right({ admin })
  }
}
