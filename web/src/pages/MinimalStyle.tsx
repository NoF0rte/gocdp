import { useState } from 'react'
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  EyeIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

// Mock data based on the CDResult model
const mockResults = [
  { id: 1, url: 'https://example.com/', status: 200, redirect: '', contentType: 'text/html', contentLength: 1234 },
  { id: 2, url: 'https://example.com/admin', status: 403, redirect: '', contentType: 'text/html', contentLength: 567 },
  { id: 3, url: 'https://example.com/login', status: 200, redirect: '', contentType: 'text/html', contentLength: 890 },
  { id: 4, url: 'https://example.com/api', status: 404, redirect: '', contentType: 'application/json', contentLength: 0 },
  { id: 5, url: 'https://example.com/redirect', status: 302, redirect: 'https://example.com/login', contentType: 'text/html', contentLength: 0 },
]

const MinimalStyle = () => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600'
    if (status >= 300 && status < 400) return 'text-yellow-600'
    if (status >= 400) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Content Discovery Results</h2>
        <p className="text-sm text-gray-600 mt-1">Clean and minimal interface for browsing enumeration results</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="text-2xl font-bold text-gray-900">{mockResults.length}</div>
          <div className="text-sm text-gray-600">Total Results</div>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="text-2xl font-bold text-green-600">
            {mockResults.filter(r => r.status >= 200 && r.status < 300).length}
          </div>
          <div className="text-sm text-gray-600">Success (2xx)</div>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {mockResults.filter(r => r.status >= 300 && r.status < 400).length}
          </div>
          <div className="text-sm text-gray-600">Redirects (3xx)</div>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="text-2xl font-bold text-red-600">
            {mockResults.filter(r => r.status >= 400).length}
          </div>
          <div className="text-sm text-gray-600">Errors (4xx/5xx)</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
          >
            <span>Filters</span>
            {showFilters ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
          </button>
          <span className="text-sm text-gray-600">
            {selectedItems.size} selected
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
            Export
          </button>
          <button className="px-3 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-800">
            <PlusIcon className="w-4 h-4 inline mr-1" />
            Add Result
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Code</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                <option value="">All Status Codes</option>
                <option value="200">200 - OK</option>
                <option value="301">301 - Moved Permanently</option>
                <option value="302">302 - Found</option>
                <option value="403">403 - Forbidden</option>
                <option value="404">404 - Not Found</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                <option value="">All Types</option>
                <option value="text/html">text/html</option>
                <option value="application/json">application/json</option>
                <option value="text/plain">text/plain</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search URL</label>
              <input
                type="text"
                placeholder="Search URLs..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white border border-gray-200 rounded">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(new Set(mockResults.map(r => r.id)))
                      } else {
                        setSelectedItems(new Set())
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockResults.map((result) => (
                <>
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(result.id)}
                        onChange={() => toggleSelection(result.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleExpanded(result.id)}
                          className="mr-2 p-1 hover:bg-gray-100 rounded"
                        >
                          {expandedRows.has(result.id) ? (
                            <ChevronDownIcon className="w-4 h-4" />
                          ) : (
                            <ChevronRightIcon className="w-4 h-4" />
                          )}
                        </button>
                        <span className="text-sm text-gray-900 font-mono">{result.url}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{result.contentType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{result.contentLength} bytes</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded text-red-600">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.has(result.id) && (
                    <tr>
                      <td colSpan={6} className="px-4 py-3 bg-gray-50">
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Redirect:</span>
                              <span className="ml-2 text-gray-600">
                                {result.redirect || 'None'}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Content Length:</span>
                              <span className="ml-2 text-gray-600">{result.contentLength} bytes</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MinimalStyle