import { Link } from 'react-router-dom'
import { PlayCircle, Plus, Music, Settings } from 'lucide-react'

export function HomePage(): JSX.Element {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">찬양 PPT</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">찬양 가사 슬라이드를 관리하고 프레젠테이션하세요.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Link
          to="/worship"
          className="group p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-2xl border border-primary-200 dark:border-primary-800 hover:shadow-lg hover:shadow-primary-500/10 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-500 text-white flex items-center justify-center mb-4">
            <PlayCircle className="w-6 h-6" />
          </div>
          <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">예배 준비</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">찬양 순서를 입력하고 슬라이드 쇼를 시작합니다.</p>
        </Link>

        <Link
          to="/songs/create"
          className="group p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-4 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">찬양 등록</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">새로운 찬양과 가사를 등록합니다.</p>
        </Link>

        <Link
          to="/songs"
          className="group p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-4 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            <Music className="w-6 h-6" />
          </div>
          <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">찬양 목록</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">등록된 찬양을 확인하고 관리합니다.</p>
        </Link>

        <Link
          to="/settings"
          className="group p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-4 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            <Settings className="w-6 h-6" />
          </div>
          <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">슬라이드 설정</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">슬라이드 쇼 스타일을 설정합니다.</p>
        </Link>
      </div>
    </div>
  )
}
