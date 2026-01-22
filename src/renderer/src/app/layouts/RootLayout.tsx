import { Outlet, Link, useLocation } from 'react-router-dom'
import { useTheme } from '@shared/lib'

const navItems = [
  { path: '/', label: '홈', icon: '🏠' },
  { path: '/songs', label: '찬양 목록', icon: '🎵' },
  { path: '/songs/create', label: '찬양 등록', icon: '✏️' }
]

export function RootLayout(): JSX.Element {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Navigation */}
      <nav className="flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-10">
              {/* Logo */}
              <Link
                to="/"
                className="flex items-center gap-2 font-bold text-xl text-slate-800 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <span className="text-2xl">🎤</span>
                <span>Worship Slides</span>
              </Link>

              {/* Nav Links */}
              <div className="flex gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                        transition-all duration-200 ease-out
                        ${
                          isActive
                            ? 'bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-900/50 dark:text-primary-300'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
                        }
                      `}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="테마 변경"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
