import React, { useState, useCallback, useRef } from 'react'
import { 
  CloudArrowUpIcon,
  FolderOpenIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { useAppStore } from '../store/appStore'
import { StatusGroup, CDResult } from '../types/api'
// import { mockScanDirectory } from '../services/api'

const MainPage = () => {
  const [dragActive, setDragActive] = useState(false)
  const [directoryPath, setDirectoryPath] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const {
    isUploading,
    uploadProgress,
    statusGroups,
    isLoading,
    errors,
    currentPage,
    itemsPerPage,
    parseFiles,
    parsePath,
    toggleGroupExpanded,
    setCurrentPage,
    setItemsPerPage,
    sortGroup,
    setGroupSearchQuery,
    reset
  } = useAppStore()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      setFiles(files)
      setDirectoryPath('') // Clear directory path when files are selected
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files)
      setFiles(files)
      setDirectoryPath('') // Clear directory path when files are selected
    }
  }, [])

  const handleParseFiles = async () => {
    if (files.length === 0) return

    await parseFiles(files)
  }

  const handleDirectoryPathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPath = e.target.value
    setDirectoryPath(newPath)
    if (newPath.trim() !== '') {
      setFiles([]) // Clear files when directory path is entered
    }
  }

  const handleParsePath = async () => {
    if (!directoryPath.trim()) {
      return
    }

    await parsePath(directoryPath.trim())
  }

  const clearResults = () => {
    reset()
    setFiles([])
    setDirectoryPath("")
  }

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600'
    if (statusCode >= 300 && statusCode < 400) return 'text-yellow-600'
    if (statusCode >= 400 && statusCode < 500) return 'text-red-600'
    if (statusCode >= 500) return 'text-red-700'
    return 'text-gray-600'
  }

  const getPaginationInfo = (group: StatusGroup) => {
    const filteredResults = group.results.filter(result => 
      group.searchQuery === '' || 
      result.url.toLowerCase().includes(group.searchQuery.toLowerCase()) ||
      result.contentType.toLowerCase().includes(group.searchQuery.toLowerCase()) ||
      (result.redirect && result.redirect.toLowerCase().includes(group.searchQuery.toLowerCase()))
    )
    
    const totalPages = Math.ceil(filteredResults.length / itemsPerPage)
    const currentPageNum = currentPage[group.statusCode] || 1
    const startIndex = (currentPageNum - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, filteredResults.length)
    
    return { totalPages, currentPageNum, startIndex, endIndex, filteredResults }
  }

  const getPaginatedResults = (group: StatusGroup) => {
    const { startIndex, endIndex, filteredResults } = getPaginationInfo(group)
    return filteredResults.slice(startIndex, endIndex)
  }

  const hasRedirects = (group: StatusGroup) => {
    return group.results.some(result => result.redirect && result.redirect.trim() !== '')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div>
                  <h1 className="text-2xl font-semibold text-white">GoCDP</h1>
                  <p className="text-slate-400 text-sm">Content Discovery Parser</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={clearResults}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg border border-slate-600 transition-colors"
              >
                Clear Results
              </button>
            </div>
          </div>
        </div>

        {/* Input Section */}
        {statusGroups.length === 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              <CloudArrowUpIcon className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-medium text-white">Input Source</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Upload */}
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                files.length > 0 
                  ? 'border-green-400 bg-green-500/5' 
                  : directoryPath.trim() 
                    ? 'border-slate-500 opacity-50' 
                    : dragActive
                      ? 'border-blue-400 bg-blue-500/5'
                      : 'border-slate-600 hover:border-slate-500'
              }`}>
                <div className="flex items-center space-x-2 mb-4">
                  <CloudArrowUpIcon className="w-5 h-5 text-slate-400" />
                  <h3 className="text-md font-medium text-white">Parse Files</h3>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={directoryPath.trim() !== ''}
                  />
                  
                  {files.length === 0 ? (
                    <div>
                      <p className="text-slate-400 text-sm mb-3">
                        {directoryPath.trim() ? 'Disabled - Directory scan active' : 'Drop files here or click to browse'}
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={directoryPath.trim() !== ''}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg border border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Browse Files
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-green-400 text-sm mb-3">{files.length} file(s) ready</p>
                      <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-slate-700 rounded p-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <DocumentTextIcon className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-300 truncate max-w-xs">{file.name}</span>
                              <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(0)}KB)</span>
                            </div>
                            <button
                              onClick={() => {
                                const newFiles = files.filter((_, i) => i !== index)
                                setFiles(newFiles)
                                // Clear the file input so the same file can be selected again
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = ''
                                }
                              }}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={handleParseFiles}
                        disabled={isUploading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isUploading ? `Parsing... ${uploadProgress}%` : 'Parse Files'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Directory Scan */}
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                directoryPath.trim() 
                  ? 'border-green-400 bg-green-500/5' 
                  : files.length > 0 
                    ? 'border-slate-500 opacity-50' 
                    : 'border-slate-600 hover:border-slate-500'
              }`}>
                <div className="flex items-center space-x-2 mb-4">
                  <FolderOpenIcon className="w-5 h-5 text-slate-400" />
                  <h3 className="text-md font-medium text-white">Parse Directory</h3>
                  <span className="text-xs text-slate-500">(Local filesystem)</span>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={directoryPath}
                    onChange={handleDirectoryPathChange}
                    placeholder="/home/user/scan-results... or /home/user/results*..."
                    disabled={files.length > 0}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:border-slate-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleParsePath}
                      disabled={isLoading || !directoryPath.trim() || files.length > 0}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg border border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Parsing...' : 'Parse Directory'}
                    </button>
                    <button
                      onClick={() => setDirectoryPath('')}
                      disabled={files.length > 0}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg border border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Clear
                    </button>
                  </div>
                  {files.length > 0 && (
                    <p className="text-slate-500 text-xs">Disabled - File upload active</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Header and Controls */}
        {statusGroups.length > 0 && (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Results</h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-slate-400">Per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        )}

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-400 mb-2">Processing Errors</h3>
                <ul className="text-sm text-red-300 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {statusGroups.length > 0 && (
          <div className="space-y-4">
            
            {/* Status Groups */}
            {statusGroups.map((group) => {
              const { totalPages, currentPageNum } = getPaginationInfo(group)
              const paginatedResults = getPaginatedResults(group)
              const showRedirectColumn = hasRedirects(group)
              
              return (
                <div
                  key={group.statusCode}
                  className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden"
                >
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroupExpanded(group.statusCode)}
                    className="w-full p-4 text-left hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`text-lg font-semibold ${getStatusColor(group.statusCode)}`}>
                          {group.statusCode}
                        </span>
                        <div>
                          <p className="text-slate-400 text-sm">{group.count} URLs</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-500">
                          {group.isExpanded ? 'Hide' : 'Show'}
                        </span>
                        {group.isExpanded ? (
                          <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Group Content */}
                  {group.isExpanded && (
                    <div className="border-t border-slate-700 bg-slate-700/30">
                      {/* Search Bar */}
                      <div className="p-4 border-b border-slate-600">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={group.searchQuery}
                            onChange={(e) => setGroupSearchQuery(group.statusCode, e.target.value)}
                            placeholder="Search URLs, content types, etc."
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:border-slate-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {paginatedResults.length > 0 ? (
                        <>
                          {/* Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-slate-600/50">
                                <tr>
                                  <th 
                                    className="px-4 py-3 text-left text-xs font-medium text-slate-300 cursor-pointer hover:bg-slate-600/50 transition-colors"
                                    onClick={() => sortGroup(group.statusCode, 'url')}
                                  >
                                    <div className="flex items-center space-x-1">
                                      <span>URL</span>
                                      {group.sortColumn === 'url' && (
                                        group.sortDirection === 'asc' ? 
                                          <ArrowUpIcon className="w-3 h-3" /> : 
                                          <ArrowDownIcon className="w-3 h-3" />
                                      )}
                                    </div>
                                  </th>
                                  <th 
                                    className="px-4 py-3 text-left text-xs font-medium text-slate-300 cursor-pointer hover:bg-slate-600/50 transition-colors"
                                    onClick={() => sortGroup(group.statusCode, 'contentType')}
                                  >
                                    <div className="flex items-center space-x-1">
                                      <span>Type</span>
                                      {group.sortColumn === 'contentType' && (
                                        group.sortDirection === 'asc' ? 
                                          <ArrowUpIcon className="w-3 h-3" /> : 
                                          <ArrowDownIcon className="w-3 h-3" />
                                      )}
                                    </div>
                                  </th>
                                  <th 
                                    className="px-4 py-3 text-left text-xs font-medium text-slate-300 cursor-pointer hover:bg-slate-600/50 transition-colors"
                                    onClick={() => sortGroup(group.statusCode, 'contentLength')}
                                  >
                                    <div className="flex items-center space-x-1">
                                      <span>Size</span>
                                      {group.sortColumn === 'contentLength' && (
                                        group.sortDirection === 'asc' ? 
                                          <ArrowUpIcon className="w-3 h-3" /> : 
                                          <ArrowDownIcon className="w-3 h-3" />
                                      )}
                                    </div>
                                  </th>
                                  {showRedirectColumn && (
                                    <th 
                                      className="px-4 py-3 text-left text-xs font-medium text-slate-300 cursor-pointer hover:bg-slate-600/50 transition-colors"
                                      onClick={() => sortGroup(group.statusCode, 'redirect')}
                                    >
                                      <div className="flex items-center space-x-1">
                                        <span>Redirect</span>
                                        {group.sortColumn === 'redirect' && (
                                          group.sortDirection === 'asc' ? 
                                            <ArrowUpIcon className="w-3 h-3" /> : 
                                            <ArrowDownIcon className="w-3 h-3" />
                                        )}
                                      </div>
                                    </th>
                                  )}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-600">
                                {paginatedResults.map((result: CDResult) => (
                                  <tr key={result.id} className="hover:bg-slate-600/30 transition-colors">
                                    <td className="px-4 py-3">
                                      <span className="text-xs text-white font-mono break-all">{result.url}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="text-xs text-slate-300">{result.contentType}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="text-xs text-slate-300">{result.contentLength}B</span>
                                    </td>
                                    {showRedirectColumn && (
                                      <td className="px-4 py-3">
                                        <span className="text-xs text-slate-300 font-mono">
                                          {result.redirect || '-'}
                                        </span>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="px-4 py-3 border-t border-slate-600 bg-slate-600/30">
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-slate-400">
                                  {((currentPageNum - 1) * itemsPerPage) + 1}-{Math.min(currentPageNum * itemsPerPage, group.count)} of {group.count}
                                </div>
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => setCurrentPage(group.statusCode, Math.max(1, currentPageNum - 1))}
                                    disabled={currentPageNum === 1}
                                    className="px-2 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    ←
                                  </button>
                                  <span className="px-2 py-1 text-xs text-slate-300">
                                    {currentPageNum}/{totalPages}
                                  </span>
                                  <button
                                    onClick={() => setCurrentPage(group.statusCode, Math.min(totalPages, currentPageNum + 1))}
                                    disabled={currentPageNum === totalPages}
                                    className="px-2 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    →
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="p-4 text-center text-slate-500 text-sm">
                          No URLs match your search criteria
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MainPage