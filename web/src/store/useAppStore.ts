import { create } from 'zustand'
import { StatusGroup, CDResult, UploadResponse as ParseFilesResponse, DirectoryScanResponse as ParsePathResponse } from '../types/api'
import { api } from '../services/api'

export interface AppState {
  // File upload state
  isUploading: boolean
  uploadProgress: number
  uploadedFiles: File[]
  
  // Results state
  statusGroups: StatusGroup[]
  totalResults: number
  isLoading: boolean
  
  // Pagination state
  currentPage: Record<number, number>
  itemsPerPage: number
  
  // Actions
  parseFiles: (files: File[]) => Promise<void>
  parsePath: (path: string) => Promise<void>
  toggleGroupExpanded: (statusCode: number) => void
  setCurrentPage: (statusCode: number, page: number) => void
  setItemsPerPage: (items: number) => void
  sortGroup: (statusCode: number, column: string) => void
  setGroupSearchQuery: (statusCode: number, query: string) => void
  reset: () => void
}

const createStatusGroups = (results: CDResult[]): StatusGroup[] => {
  const groups: Record<number, CDResult[]> = {}

  // Group results by individual status codes
  results.forEach(result => {
    if (!groups[result.status]) {
      groups[result.status] = []
    }
    groups[result.status].push(result)
  })

  return Object.entries(groups)
    .map(([statusCode, groupResults]) => ({
      statusCode: parseInt(statusCode),
      count: groupResults.length,
      results: groupResults,
      isExpanded: false,
      sortColumn: null,
      sortDirection: 'asc' as const,
      searchQuery: ''
    }))
    .sort((a, b) => a.statusCode - b.statusCode)
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  isUploading: false,
  uploadProgress: 0,
  uploadedFiles: [],
  statusGroups: [],
  totalResults: 0,
  isLoading: false,
  currentPage: {},
  itemsPerPage: 10,

  parseFiles: async (files: File[]) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    set({ isUploading: true, isLoading: true })
    try {
      const response = await api.post<ParseFilesResponse>('/parse/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          )

          set({ uploadProgress: progress })
        },
      })

      const groups = createStatusGroups(response.data.results)
      const totalResults = groups.reduce((sum, group) => sum + group.count, 0)
      set({
        statusGroups: groups,
        totalResults,
        isLoading: false,
        isUploading: false,
      })
    } catch (error) {
      set({ isUploading: false, isLoading: false })
      console.error('Upload error:', error)
      throw new Error('Failed to upload files')
    }
  },

  parsePath: async (directoryPath: string) => {
    set({ isUploading: true, isLoading: true })

    try {
      const response = await api.post<ParsePathResponse>('/parse/path', {
        path: directoryPath
      })
      
      const groups = createStatusGroups(response.data.results)
      const totalResults = groups.reduce((sum, group) => sum + group.count, 0)
      set({
        statusGroups: groups,
        totalResults,
        isLoading: false,
        isUploading: false,
      })
    } catch (error) {
      set({ isUploading: false, isLoading: false })
      console.error('Upload error:', error)
      throw new Error('Failed to scan directory')
    }
  },
  
  toggleGroupExpanded: (statusCode) => set((state) => ({
    statusGroups: state.statusGroups.map(group =>
      group.statusCode === statusCode
        ? { ...group, isExpanded: !group.isExpanded }
        : group
    )
  })),
  
  setCurrentPage: (statusCode, page) => set((state) => ({
    currentPage: { ...state.currentPage, [statusCode]: page }
  })),

  sortGroup: (statusCode, column) => set((state) => ({
    statusGroups: state.statusGroups.map(group => {
      if (group.statusCode !== statusCode) return group
      
      const newDirection = group.sortColumn === column && group.sortDirection === 'asc' ? 'desc' : 'asc'
      const sortedResults = [...group.results].sort((a, b) => {
        let aVal: any = a[column as keyof CDResult]
        let bVal: any = b[column as keyof CDResult]
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }
        
        if (aVal < bVal) return newDirection === 'asc' ? -1 : 1
        if (aVal > bVal) return newDirection === 'asc' ? 1 : -1
        return 0
      })
      
      return {
        ...group,
        results: sortedResults,
        sortColumn: column,
        sortDirection: newDirection
      }
    })
  })),

  setGroupSearchQuery: (statusCode, query) => set((state) => ({
    statusGroups: state.statusGroups.map(group =>
      group.statusCode === statusCode
        ? { ...group, searchQuery: query }
        : group
    )
  })),
  
  setItemsPerPage: (items) => set({ itemsPerPage: items }),
  
  reset: () => set({
    isUploading: false,
    uploadProgress: 0,
    uploadedFiles: [],
    statusGroups: [],
    totalResults: 0,
    isLoading: false,
    currentPage: {}
  })
}))
