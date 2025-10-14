import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import MainPage from './pages/MainPage'
import MinimalStyle from './pages/MinimalStyle'
import ModernStyle from './pages/ModernStyle'
import DarkStyle from './pages/DarkStyle'
import ColorfulStyle from './pages/ColorfulStyle'
import CorporateStyle from './pages/CorporateStyle'

const Navigation = () => {
  const location = useLocation()
  
  const styles = [
    { id: 'main', name: 'Main App', path: '/main' },
    { id: 'minimal', name: 'Minimal/Clean', path: '/minimal' },
    { id: 'modern', name: 'Modern/Material', path: '/modern' },
    { id: 'dark', name: 'Dark Theme', path: '/dark' },
    { id: 'colorful', name: 'Colorful/Vibrant', path: '/colorful' },
    { id: 'corporate', name: 'Corporate/Professional', path: '/corporate' },
  ]

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            GoCDP Frontend Test Pages
          </Link>
          <nav className="flex space-x-2">
            {styles.map((style) => (
              <Link
                key={style.id}
                to={style.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === style.path
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {style.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

const HomePage = () => {
  const styles = [
    { id: 'main', name: 'Main Application', path: '/main', description: 'Full-featured content discovery analysis tool' },
    { id: 'minimal', name: 'Minimal/Clean', path: '/minimal', description: 'Clean and simple interface with subtle styling' },
    { id: 'modern', name: 'Modern/Material', path: '/modern', description: 'Material design with gradients and shadows' },
    { id: 'dark', name: 'Dark Theme', path: '/dark', description: 'Dark interface with neon accents' },
    { id: 'colorful', name: 'Colorful/Vibrant', path: '/colorful', description: 'Bright colors and playful styling' },
    { id: 'corporate', name: 'Corporate/Professional', path: '/corporate', description: 'Professional look for enterprise use' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">GoCDP Frontend Test Pages</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from 5 different UI styles to find the perfect look for your content discovery tool.
            Each style showcases various components like tables, buttons, forms, and interactive elements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {styles.map((style) => (
            <Link
              key={style.id}
              to={style.path}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-blue-300 group"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {style.name}
              </h3>
              <p className="text-gray-600 mb-4">{style.description}</p>
              <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                View Style
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 bg-blue-50 rounded-lg p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">About GoCDP</h2>
          <p className="text-blue-800 mb-4">
            GoCDP (Golang Content Discovery Parser) is a tool for parsing and normalizing content discovery output 
            from various security tools like ffuf, gobuster, dirb, and more.
          </p>
          <p className="text-blue-700">
            This frontend demonstrates different UI approaches for displaying and managing content enumeration results, 
            including filtering, sorting, and detailed views of discovered endpoints.
          </p>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/minimal" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <MinimalStyle />
            </div>
          } />
          <Route path="/modern" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <ModernStyle />
            </div>
          } />
          <Route path="/dark" element={<DarkStyle />} />
          <Route path="/colorful" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <ColorfulStyle />
            </div>
          } />
          <Route path="/corporate" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <CorporateStyle />
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App