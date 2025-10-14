export interface CDResult {
  id: string
  url: string
  status: number
  redirect: string
  contentType: string
  contentLength: number
}

export interface StatusGroup {
  statusCode: number
  count: number
  results: CDResult[]
  isExpanded: boolean
  sortColumn: string | null
  sortDirection: 'asc' | 'desc'
  searchQuery: string
}


export interface UploadResponse {
  results: CDResult[]
  errors: string[]
}

export interface DirectoryScanResponse {
  results: CDResult[]
  error: string
}