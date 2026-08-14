import z from 'zod'

export type UserStatusFilter = 'ACTIVE' | 'INACTIVE' | 'ALL'

export interface PaginationParams {
  q?: string | null
  page: number
  perPage: number
  orderBy?: 'firstName' | 'email' | 'createdAt'
  order?: 'asc' | 'desc'
  status?: UserStatusFilter
}

export interface PaginatedResult<T> {
  items: T[]
  meta: {
    page: number
    perPage: number
    totalCount: number
    totalPages: number
    orderBy: 'firstName' | 'email' | 'createdAt'
    order: 'asc' | 'desc'
  }
}

export const paginationQueryParamSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().default(1),
  perPage: z.coerce
    .number()
    .min(10, { error: 'Mínimo de 10 itens por página' })
    .max(30, { error: 'Máximo de 30 itens por página' })
    .default(10),
  orderBy: z
    .enum(['firstName', 'email', 'createdAt'])
    .optional()
    .default('firstName'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ALL']).optional().default('ACTIVE'),
})

export type PaginationQueryParamDTO = z.infer<typeof paginationQueryParamSchema>
