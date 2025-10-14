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
  SparklesIcon,
  FireIcon
} from '@heroicons/react/24/outline'

// Mock data based on the CDResult model
const mockResults = [
  { id: 1, url: 'https://example.com/', status: 200, redirect: '', contentType: 'text/html', contentLength: 1234 },
  { id: 2, url: 'https://example.com/admin', status: 403, redirect: '', contentType: 'text/html', contentLength: 567 },
  { id: 3, url: 'https://example.com/login', status: 200, redirect: '', contentType: 'text/html', contentLength: 890 },
  { id: 4, url: 'https://example.com/api', status: 404, redirect: '', contentType: 'application/json', contentLength: 0 },
  { id: 5, url: 'https://example.com/redirect', status: 302, redirect: 'https://example.com/login', contentType: 'text/html', contentLength: 0 },
]

const ColorfulStyle = () => {
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
    if (status >= 200 && status < 300) return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/25'
    if (status >= 300 && status < 400) return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/25'
    if (status >= 400) return 'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg shadow-red-500/25'
    return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-500/25'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="space-y-8 p-8">
        {/* Header with rainbow gradient */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-indigo-600/20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-2 flex items-center">
                <SparklesIcon className="w-8 h-8 mr-3 text-yellow-300" />
                Content Discovery Results
              </h2>
              <p className="text-pink-100 text-lg">Vibrant and colorful interface with gradients</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl hover:bg-white/30 transition-all hover:scale-105 border border-white/30">
                <ChartBarIcon className="w-6 h-6" />
              </button>
              <button className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl hover:bg-white/30 transition-all hover:scale-105 border border-white/30">
                <FireIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards with vibrant colors */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold">{mockResults.length}</div>
                <div className="text-blue-100 mt-1">Total Results</div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <ChartBarIcon className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold">
                  {mockResults.filter(r => r.status >= 200 && r.status < 300).length}
                </div>
                <div className="text-green-100 mt-1">Success (2xx)</div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold">
                  {mockResults.filter(r => r.status >= 300 && r.status < 400).length}
                </div>
                <div className="text-yellow-100 mt-1">Redirects (3xx)</div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold">
                  {mockResults.filter(r => r.status >= 400).length}
                </div>
                <div className="text-red-100 mt-1">Errors (4xx/5xx)</div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-pink-200">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-purple-400" />
              <input
                type="text"
                placeholder="Search URLs, status codes, or content types..."
                className="w-full pl-12 pr-4 py-4 border-2 border-purple-200 rounded-2xl text-gray-700 placeholder-purple-400 focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 ${
                showFilters 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' 
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
              }`}
            >
              <FunnelIcon className="w-6 h-6 inline mr-2" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t-2 border-purple-100 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-lg font-bold text-purple-700 mb-3">Status Code Range</label>
                  <select className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3 text-gray-700 focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all">
                    <option value="">All Status Codes</option>
                    <option value="200">200 - OK</option>
                    <option value="301">301 - Moved Permanently</option>
                    <option value="302">302 - Found</option>
                    <option value="403">403 - Forbidden</option>
                    <option value="404">404 - Not Found</option>
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-bold text-pink-700 mb-3">Content Type</label>
                  <select className="w-full border-2 border-pink-200 rounded-2xl px-4 py-3 text-gray-700 focus:ring-4 focus:ring-pink-200 focus:border-pink-400 transition-all">
                    <option value="">All Types</option>
                    <option value="text/html">text/html</option>
                    <option value="application/json">application/json</option>
                    <option value="text/plain">text/plain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-bold text-indigo-700 mb-3">Content Length</label>
                  <select className="w-full border-2 border-indigo-200 rounded-2xl px-4 py-3 text-gray-700 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
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
        <div className="bg-white rounded-3xl shadow-xl border border-pink-200 overflow-hidden">
          <div className="px-8 py-6 border-b-2 border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-purple-800">Results</h3>
              <div className="flex items-center space-x-6">
                <span className="text-lg text-purple-600 font-semibold">
                  {selectedItems.size} of {mockResults.length} selected
                </span>
                <div className="flex items-center space-x-3">
                  <button className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-2xl hover:from-gray-200 hover:to-gray-300 transition-all transform hover:scale-105 font-semibold">
                    Export
                  </button>
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 font-semibold flex items-center shadow-lg shadow-purple-500/25">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Result
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-100 to-pink-100">
                <tr>
                  <th className="px-8 py-6 text-left">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-purple-600 bg-white border-2 border-purple-300 rounded focus:ring-4 focus:ring-purple-200"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(new Set(mockResults.map(r => r.id)))
                        } else {
                          setSelectedItems(new Set())
                        }
                      }}
                    />
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-purple-800 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-purple-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-purple-800 uppercase tracking-wider">
                    Content Type
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-purple-800 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-purple-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-purple-100">
                {mockResults.map((result) => (
                  <>
                    <tr key={result.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all">
                      <td className="px-8 py-6">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(result.id)}
                          onChange={() => toggleSelection(result.id)}
                          className="w-5 h-5 text-purple-600 bg-white border-2 border-purple-300 rounded focus:ring-4 focus:ring-purple-200"
                        />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleExpanded(result.id)}
                            className="mr-4 p-2 hover:bg-purple-100 rounded-xl transition-all"
                          >
                            {expandedRows.has(result.id) ? (
                              <ChevronDownIcon className="w-6 h-6 text-purple-600" />
                            ) : (
                              <ChevronRightIcon className="w-6 h-6 text-purple-600" />
                            )}
                          </button>
                          <span className="text-sm text-gray-800 font-mono font-semibold">{result.url}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex px-4 py-2 rounded-2xl text-sm font-bold ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm text-gray-700 font-semibold">{result.contentType}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm text-gray-700 font-semibold">{result.contentLength} bytes</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <button className="p-3 hover:bg-purple-100 rounded-xl transition-all">
                            <EyeIcon className="w-5 h-5 text-purple-600" />
                          </button>
                          <button className="p-3 hover:bg-pink-100 rounded-xl transition-all">
                            <PencilIcon className="w-5 h-5 text-pink-600" />
                          </button>
                          <button className="p-3 hover:bg-red-100 rounded-xl transition-all">
                            <TrashIcon className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(result.id) && (
                      <tr>
                        <td colSpan={6} className="px-8 py-6 bg-gradient-to-r from-purple-50 to-pink-50">
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                              <div className="bg-white rounded-2xl p-6 border-2 border-purple-200">
                                <h4 className="font-bold text-purple-800 mb-3 text-lg">Redirect Information</h4>
                                <p className="text-sm text-gray-700 font-mono bg-purple-50 p-3 rounded-xl">
                                  {result.redirect || 'No redirect'}
                                </p>
                              </div>
                              <div className="bg-white rounded-2xl p-6 border-2 border-pink-200">
                                <h4 className="font-bold text-pink-800 mb-3 text-lg">Content Details</h4>
                                <p className="text-sm text-gray-700 bg-pink-50 p-3 rounded-xl">
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

export default ColorfulStyle