import { Module } from '@nestjs/common'
import { EmployeeRegisterController } from './controllers/register/employee-register.controller'
import { DatabaseModule } from '../database/database.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { RegisterEmployeeUseCase } from '@/domain/help-desk/application/use-cases/register-employee'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  providers: [RegisterEmployeeUseCase],
  controllers: [EmployeeRegisterController],
})
export class HttpModule {}
