import { Outlet, Link, useLocation } from 'react-router-dom'
import { useTheme } from '@shared/lib'
import { Home, Music, PenLine, Moon, Sun } from 'lucide-react'

const navItems = [
  { path: '/', label: '홈', icon: Home },
  { path: '/songs', label: '찬양 목록', icon: Music },
  { path: '/songs/create', label: '찬양 등록', icon: PenLine }
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
                <span>찬양 PPT</span>
              </Link>

              {/* Nav Links */}
              <div className="flex gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path
                  const Icon = item.icon
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
                      <Icon className="w-4 h-4" />
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
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
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
