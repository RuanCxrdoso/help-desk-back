export interface PaginationParams {
  q: string | null
  page: number
  perPage: number
  orderBy: string
  order: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  items: T[]
  page: number
  perPage: number
  totalCount: number
  totalPages: number
  orderBy: string
  order: 'asc' | 'desc'
}
