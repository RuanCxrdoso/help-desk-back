import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { ZodType, ZodError, treeifyError } from 'zod'

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: any) {
    try {
      const parsedValue = this.schema.parse(value)

      return parsedValue
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed.',
          statusCode: 400,
          errors: treeifyError(error),
        })
      }

      throw new BadRequestException('Validation failed')
    }
  }
}
