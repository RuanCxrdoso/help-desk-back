/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common'
import { DomainError } from '@/core/error/domain-error'
import { domainErrorMapping } from './domain-error-mapping'
import { Response } from 'express'

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter<DomainError> {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const status =
      domainErrorMapping.get(exception.constructor as any) ||
      HttpStatus.UNPROCESSABLE_ENTITY

    response.status(status).send({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    })
  }
}
