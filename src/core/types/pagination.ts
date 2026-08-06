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
  page: number
  perPage: number
  totalCount: number
  totalPages: number
  orderBy: 'firstName' | 'email' | 'createdAt'
  order: 'asc' | 'desc'
}
