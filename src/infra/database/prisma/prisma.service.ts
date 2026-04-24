import 'dotenv/config'
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'generated/prisma/client'
import { EnvService } from '@/infra/env/env.service'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(env: EnvService) {
    const databaseUrl = env.get('DATABASE_URL')
    const databaseSchema = env.get('DB_SCHEMA')

    const adapter = new PrismaPg(
      {
        connectionString: databaseUrl,
      },
      {
        schema: databaseSchema,
      },
    )
    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
