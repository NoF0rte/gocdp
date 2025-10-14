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
  ArrowPathIcon,
  BuildingOfficeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

// Mock data based on the CDResult model
const mockResults = [
  { id: 1, url: 'https://example.com/', status: 200, redirect: '', contentType: 'text/html', contentLength: 1234 },
  { id: 2, url: 'https://example.com/admin', status: 403, redirect: '', contentType: 'text/html', contentLength: 567 },
  { id: 3, url: 'https://example.com/login', status: 200, redirect: '', contentType: 'text/html', contentLength: 890 },
  { id: 4, url: 'https://example.com/api', status: 404, redirect: '', contentType: 'application/json', contentLength: 0 },
  { id: 5, url: 'https://example.com/redirect', status: 302, redirect: 'https://example.com/login', contentType: 'text/html', contentLength: 0 },
]

const CorporateStyle = () => {
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
    if (status >= 200 && status < 300) return 'bg-green-50 text-green-700 border-green-200'
    if (status >= 300 && status < 400) return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    if (status >= 400) return 'bg-red-50 text-red-700 border-red-200'
    return 'bg-gray-50 text-gray-700 border-gray-200'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="space-y-8 p-8">
        {/* Header with corporate styling */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Content Discovery Results</h2>
                <p className="text-slate-600 mt-1">Professional interface for enterprise security analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                <ChartBarIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                <DocumentTextIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards with professional styling */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-slate-900">{mockResults.length}</div>
                <div className="text-sm text-slate-600 mt-1 font-medium">Total Results</div>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-700">
                  {mockResults.filter(r => r.status >= 200 && r.status < 300).length}
                </div>
                <div className="text-sm text-slate-600 mt-1 font-medium">Success (2xx)</div>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-700">
                  {mockResults.filter(r => r.status >= 300 && r.status < 400).length}
                </div>
                <div className="text-sm text-slate-600 mt-1 font-medium">Redirects (3xx)</div>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-700">
                  {mockResults.filter(r => r.status >= 400).length}
                </div>
                <div className="text-sm text-slate-600 mt-1 font-medium">Errors (4xx/5xx)</div>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search URLs, status codes, or content types..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-md font-medium transition-colors ${
                showFilters 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FunnelIcon className="w-5 h-5 inline mr-2" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-slate-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status Code Range</label>
                  <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                    <option value="">All Status Codes</option>
                    <option value="200">200 - OK</option>
                    <option value="301">301 - Moved Permanently</option>
                    <option value="302">302 - Found</option>
                    <option value="403">403 - Forbidden</option>
                    <option value="404">404 - Not Found</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Content Type</label>
                  <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                    <option value="">All Types</option>
                    <option value="text/html">text/html</option>
                    <option value="application/json">application/json</option>
                    <option value="text/plain">text/plain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Content Length</label>
                  <select className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
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
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Results</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600">
                  {selectedItems.size} of {mockResults.length} selected
                </span>
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors font-medium">
                    Export
                  </button>
                  <button className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 transition-colors font-medium flex items-center">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Result
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-slate-600 bg-white border-slate-300 rounded focus:ring-slate-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(new Set(mockResults.map(r => r.id)))
                        } else {
                          setSelectedItems(new Set())
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Content Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {mockResults.map((result) => (
                  <>
                    <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(result.id)}
                          onChange={() => toggleSelection(result.id)}
                          className="w-4 h-4 text-slate-600 bg-white border-slate-300 rounded focus:ring-slate-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleExpanded(result.id)}
                            className="mr-3 p-1 hover:bg-slate-100 rounded transition-colors"
                          >
                            {expandedRows.has(result.id) ? (
                              <ChevronDownIcon className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                            )}
                          </button>
                          <span className="text-sm text-slate-900 font-mono">{result.url}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{result.contentType}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{result.contentLength} bytes</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 hover:bg-slate-100 rounded transition-colors">
                            <EyeIcon className="w-4 h-4 text-slate-500" />
                          </button>
                          <button className="p-1 hover:bg-slate-100 rounded transition-colors">
                            <PencilIcon className="w-4 h-4 text-slate-500" />
                          </button>
                          <button className="p-1 hover:bg-red-50 rounded transition-colors">
                            <TrashIcon className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(result.id) && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-slate-50">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="bg-white border border-slate-200 rounded-md p-4">
                                <h4 className="font-semibold text-slate-700 mb-2">Redirect Information</h4>
                                <p className="text-sm text-slate-600 font-mono bg-slate-50 p-2 rounded">
                                  {result.redirect || 'No redirect'}
                                </p>
                              </div>
                              <div className="bg-white border border-slate-200 rounded-md p-4">
                                <h4 className="font-semibold text-slate-700 mb-2">Content Details</h4>
                                <p className="text-sm text-slate-600">
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

export default CorporateStyle