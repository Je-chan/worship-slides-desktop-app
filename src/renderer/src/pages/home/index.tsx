import { Link } from 'react-router-dom'
import { PlayCircle, Plus, Music, Settings, ArrowRight, Home } from 'lucide-react'
import { PageHeader } from '@shared/ui'

const menuItems = [
  {
    to: '/worship',
    icon: PlayCircle,
    title: '예배 준비',
    description: '찬양 순서를 입력하고 슬라이드 쇼를 시작합니다.',
    primary: true
  },
  {
    to: '/songs/create',
    icon: Plus,
    title: '찬양 등록',
    description: '새로운 찬양과 가사를 등록합니다.'
  },
  {
    to: '/songs',
    icon: Music,
    title: '찬양 목록',
    description: '등록된 찬양을 확인하고 관리합니다.'
  },
  {
    to: '/settings',
    icon: Settings,
    title: '슬라이드 설정',
    description: '슬라이드 쇼 스타일을 설정합니다.'
  }
]

export function HomePage(): JSX.Element {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader icon={Home} title="홈" description="원하는 기능을 선택하세요." />

      {/* Menu Cards */}
      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`
                group relative overflow-hidden rounded-xl transition-all duration-200
                ${item.primary
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/25 hover:-translate-y-0.5'
                  : 'bg-white border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:border-slate-300/80 hover:-translate-y-0.5 dark:bg-slate-800/80 dark:border-slate-700/50 dark:shadow-slate-900/20 dark:hover:border-slate-600'
                }
              `}
            >
              <div className="p-5">
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center mb-3
                  ${item.primary
                    ? 'bg-white/15'
                    : 'bg-slate-100 dark:bg-slate-700/80'
                  }
                `}>
                  <Icon
                    className={`w-5 h-5 ${
                      item.primary
                        ? 'text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  />
                </div>
                <h3
                  className={`font-semibold mb-1 ${
                    item.primary
                      ? 'text-white'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {item.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    item.primary
                      ? 'text-primary-100'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.description}
                </p>
                <div className={`
                  mt-3 flex items-center gap-1 text-sm font-medium opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0
                  ${item.primary ? 'text-white/90' : 'text-primary-600 dark:text-primary-400'}
                `}>
                  <span>이동</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
