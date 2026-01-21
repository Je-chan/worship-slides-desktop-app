import { Outlet, Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: '홈' },
  { path: '/songs', label: '찬양 목록' },
  { path: '/songs/create', label: '찬양 등록' }
]

export function RootLayout(): JSX.Element {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center h-14 gap-8">
            <Link to="/" className="font-semibold text-lg text-slate-900">
              Worship Slides
            </Link>
            <div className="flex gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
