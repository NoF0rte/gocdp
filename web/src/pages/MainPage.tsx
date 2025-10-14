import { useState, useCallback, useRef } from 'react'
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
import { useAppStore } from '../store/useAppStore'
import { StatusGroup, CDResult } from '../types/api'
// import { mockScanDirectory } from '../services/api'

const MainPage = () => {
  const [dragActive, setDragActive] = useState(false)
  const [directoryPath, setDirectoryPath] = useState('')
  const [showDirectoryInput, setShowDirectoryInput] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const {
    isUploading,
    uploadProgress,
    statusGroups,
    totalResults,
    isLoading,
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
      setUploadedFiles(files)
    }
  }, [setUploadedFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files)
      setUploadedFiles(files)
    }
  }, [setUploadedFiles])

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return

    await parseFiles(uploadedFiles)
  }

  const handleDirectoryScan = async () => {
    if (!directoryPath.trim()) {
      return
    }

    await parsePath(directoryPath.trim())
  }

  const clearResults = () => {
    reset()
  }

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600'
    if (statusCode >= 300 && statusCode < 400) return 'text-yellow-600'
    if (statusCode >= 400 && statusCode < 500) return 'text-red-600'
    if (statusCode >= 500) return 'text-red-700'
    return 'text-gray-600'
  }

  // const getStatusBadgeColor = (statusCode: number) => {
  //   if (statusCode >= 200 && statusCode < 300) return 'bg-green-100 text-green-800 border-green-200'
  //   if (statusCode >= 300 && statusCode < 400) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  //   if (statusCode >= 400 && statusCode < 500) return 'bg-red-100 text-red-800 border-red-200'
  //   if (statusCode >= 500) return 'bg-red-100 text-red-900 border-red-300'
  //   return 'bg-gray-100 text-gray-800 border-gray-200'
  // }

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
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center border border-slate-600">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-white">GoCDP</h1>
                  <p className="text-slate-400 text-sm">Content Discovery Parser & Analyzer</p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm text-slate-500">
                <span>• Parse ffuf, gobuster, dirb output</span>
                <span>• Group by status codes</span>
                <span>• Sortable & filterable tables</span>
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

        {/* Upload Section */}
        {statusGroups.length === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Upload */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CloudArrowUpIcon className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-medium text-white">Upload Files</h2>
                <span className="text-xs text-slate-500">(JSON, TXT, CSV)</span>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-400 bg-blue-500/5'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".json,.txt,.csv"
                  onChange={handleFileInput}
                  className="hidden"
                />
                
                {uploadedFiles.length === 0 ? (
                  <div>
                    <p className="text-slate-400 text-sm mb-3">Drop files here or click to browse</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg border border-slate-600 transition-colors"
                    >
                      Browse Files
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-green-400 text-sm mb-3">{uploadedFiles.length} file(s) ready</p>
                    <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-700 rounded p-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <DocumentTextIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300 truncate max-w-xs">{file.name}</span>
                            <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(0)}KB)</span>
                          </div>
                          <button
                            onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUploading ? `Processing... ${uploadProgress}%` : 'Process Files'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Directory Scan */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FolderOpenIcon className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-medium text-white">Scan Directory</h2>
                <span className="text-xs text-slate-500">(Local filesystem)</span>
              </div>

              {!showDirectoryInput ? (
                <button
                  onClick={() => setShowDirectoryInput(true)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg border border-slate-600 transition-colors"
                >
                  Choose Directory
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={directoryPath}
                    onChange={(e) => setDirectoryPath(e.target.value)}
                    placeholder="/home/user/scan-results"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:border-slate-500 focus:outline-none"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDirectoryScan}
                      disabled={isLoading || !directoryPath.trim()}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg border border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Scanning...' : 'Scan'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDirectoryInput(false)
                        setDirectoryPath('')
                      }}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg border border-slate-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Section */}
        {statusGroups.length > 0 && (
          <div className="space-y-4">
            {/* Results Header */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-white mb-1">Analysis Results</h2>
                  <p className="text-slate-400 text-sm">{totalResults} URLs found across {statusGroups.length} status codes</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-slate-400">Per page:</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Groups */}
            <div className="space-y-3">
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
                              placeholder="Search URLs,content types, etc."
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
          </div>
        )}
      </div>
    </div>
  )
}

export default MainPage