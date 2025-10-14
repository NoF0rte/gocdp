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

const DarkStyle = () => {
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
    if (status >= 200 && status < 300) return 'bg-green-900/30 text-green-400 border-green-500/50'
    if (status >= 300 && status < 400) return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50'
    if (status >= 400) return 'bg-red-900/30 text-red-400 border-red-500/50'
    return 'bg-gray-800 text-gray-400 border-gray-600'
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="space-y-8 p-8 max-w-7xl mx-auto">
        {/* Header with neon accent */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Content Discovery Results
              </h2>
              <p className="text-gray-400">Dark theme interface with neon accents</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-3 bg-gray-800 border border-gray-600 rounded-xl hover:bg-gray-700 transition-all hover:border-blue-500/50">
                <ChartBarIcon className="w-6 h-6 text-blue-400" />
              </button>
              <button className="p-3 bg-gray-800 border border-gray-600 rounded-xl hover:bg-gray-700 transition-all hover:border-purple-500/50">
                <ArrowPathIcon className="w-6 h-6 text-purple-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards with glow effects */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white">{mockResults.length}</div>
                <div className="text-sm text-gray-400 mt-1">Total Results</div>
              </div>
              <div className="w-12 h-12 bg-blue-900/30 border border-blue-500/50 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-400">
                  {mockResults.filter(r => r.status >= 200 && r.status < 300).length}
                </div>
                <div className="text-sm text-gray-400 mt-1">Success (2xx)</div>
              </div>
              <div className="w-12 h-12 bg-green-900/30 border border-green-500/50 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-400">
                  {mockResults.filter(r => r.status >= 300 && r.status < 400).length}
                </div>
                <div className="text-sm text-gray-400 mt-1">Redirects (3xx)</div>
              </div>
              <div className="w-12 h-12 bg-yellow-900/30 border border-yellow-500/50 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-500/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-400">
                  {mockResults.filter(r => r.status >= 400).length}
                </div>
                <div className="text-sm text-gray-400 mt-1">Errors (4xx/5xx)</div>
              </div>
              <div className="w-12 h-12 bg-red-900/30 border border-red-500/50 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-red-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search URLs, status codes, or content types..."
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                showFilters 
                  ? 'bg-blue-600 text-white border border-blue-500' 
                  : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
              }`}
            >
              <FunnelIcon className="w-5 h-5 inline mr-2" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-gray-700 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Status Code Range</label>
                  <select className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Status Codes</option>
                    <option value="200">200 - OK</option>
                    <option value="301">301 - Moved Permanently</option>
                    <option value="302">302 - Found</option>
                    <option value="403">403 - Forbidden</option>
                    <option value="404">404 - Not Found</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Content Type</label>
                  <select className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Types</option>
                    <option value="text/html">text/html</option>
                    <option value="application/json">application/json</option>
                    <option value="text/plain">text/plain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Content Length</label>
                  <select className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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
        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-900/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Results</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">
                  {selectedItems.size} of {mockResults.length} selected
                </span>
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 bg-gray-700 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors">
                    Export
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white border border-blue-500 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Result
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(new Set(mockResults.map(r => r.id)))
                        } else {
                          setSelectedItems(new Set())
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Content Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {mockResults.map((result) => (
                  <>
                    <tr key={result.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(result.id)}
                          onChange={() => toggleSelection(result.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleExpanded(result.id)}
                            className="mr-3 p-1 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {expandedRows.has(result.id) ? (
                              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <span className="text-sm text-white font-mono">{result.url}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-300">{result.contentType}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-300">{result.contentLength} bytes</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                            <EyeIcon className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                            <PencilIcon className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-red-900/30 rounded-lg transition-colors">
                            <TrashIcon className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(result.id) && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-700/30">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-gray-300 mb-2">Redirect Information</h4>
                                <p className="text-sm text-gray-400 font-mono">
                                  {result.redirect || 'No redirect'}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-300 mb-2">Content Details</h4>
                                <p className="text-sm text-gray-400">
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
    </div>
  )
}

export default DarkStyle