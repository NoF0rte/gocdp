import { useState } from 'react'
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  EyeIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

// Mock data based on the CDResult model
const mockResults = [
  { id: 1, url: 'https://example.com/', status: 200, redirect: '', contentType: 'text/html', contentLength: 1234 },
  { id: 2, url: 'https://example.com/admin', status: 403, redirect: '', contentType: 'text/html', contentLength: 567 },
  { id: 3, url: 'https://example.com/login', status: 200, redirect: '', contentType: 'text/html', contentLength: 890 },
  { id: 4, url: 'https://example.com/api', status: 404, redirect: '', contentType: 'application/json', contentLength: 0 },
  { id: 5, url: 'https://example.com/redirect', status: 302, redirect: 'https://example.com/login', contentType: 'text/html', contentLength: 0 },
]

const ModernStyle = () => {
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
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800'
    if (status >= 300 && status < 400) return 'bg-yellow-100 text-yellow-800'
    if (status >= 400) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-8">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Content Discovery Results</h2>
            <p className="text-blue-100">Modern interface with material design principles</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all">
              <ChartBarIcon className="w-6 h-6" />
            </button>
            <button className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all">
              <ArrowPathIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards with elevation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">{mockResults.length}</div>
              <div className="text-sm text-gray-600 mt-1">Total Results</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600">
                {mockResults.filter(r => r.status >= 200 && r.status < 300).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Success (2xx)</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-yellow-600">
                {mockResults.filter(r => r.status >= 300 && r.status < 400).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Redirects (3xx)</div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-yellow-600 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-red-600">
                {mockResults.filter(r => r.status >= 400).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Errors (4xx/5xx)</div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-red-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search URLs, status codes, or content types..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              showFilters 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FunnelIcon className="w-5 h-5 inline mr-2" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status Code Range</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">All Status Codes</option>
                  <option value="200">200 - OK</option>
                  <option value="301">301 - Moved Permanently</option>
                  <option value="302">302 - Found</option>
                  <option value="403">403 - Forbidden</option>
                  <option value="404">404 - Not Found</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Content Type</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">All Types</option>
                  <option value="text/html">text/html</option>
                  <option value="application/json">application/json</option>
                  <option value="text/plain">text/plain</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Content Length</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Any Size</option>
                  <option value="small">Small (&lt; 1KB)</option>
                  <option value="medium">Medium (1KB - 10KB)</option>
                  <option value="large">Large (&gt; 10KB)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Results</h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {selectedItems.size} of {mockResults.length} selected
              </span>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Export
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Result
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(new Set(mockResults.map(r => r.id)))
                      } else {
                        setSelectedItems(new Set())
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Content Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockResults.map((result) => (
                <>
                  <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(result.id)}
                        onChange={() => toggleSelection(result.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleExpanded(result.id)}
                          className="mr-3 p-1 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          {expandedRows.has(result.id) ? (
                            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        <span className="text-sm text-gray-900 font-mono">{result.url}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{result.contentType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{result.contentLength} bytes</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <EyeIcon className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <PencilIcon className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                          <TrashIcon className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.has(result.id) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Redirect Information</h4>
                              <p className="text-sm text-gray-600 font-mono">
                                {result.redirect || 'No redirect'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Content Details</h4>
                              <p className="text-sm text-gray-600">
                                {result.contentLength} bytes • {result.contentType}
                              </p>
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

export default ModernStyle