import z from 'zod'

export const envSchema = z.object({
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_SCHEMA: z.string().default('public'),
  DB_PORT: z.coerce.number().optional().default(5432),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().optional().default(3333),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  NODE_ENV: z
    .enum(['production', 'development', 'test'])
    .default('development'),
})

export type Env = z.infer<typeof envSchema>
