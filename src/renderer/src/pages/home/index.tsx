import { Link } from 'react-router-dom'

export function HomePage(): JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Worship Slides</h1>
        <p className="mt-1 text-slate-600">찬양 가사 슬라이드를 관리하고 프레젠테이션하세요.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/songs/create"
          className="p-6 bg-white rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all"
        >
          <h2 className="font-semibold text-slate-900">찬양 등록</h2>
          <p className="mt-1 text-sm text-slate-600">새로운 찬양과 가사를 등록합니다.</p>
        </Link>

        <div className="p-6 bg-white rounded-xl border border-slate-200 opacity-50">
          <h2 className="font-semibold text-slate-900">프레젠테이션</h2>
          <p className="mt-1 text-sm text-slate-600">찬양 순서를 입력하고 슬라이드를 시작합니다.</p>
        </div>
      </div>
    </div>
  )
}
