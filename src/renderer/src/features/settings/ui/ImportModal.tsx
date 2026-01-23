import { CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@shared/ui'
import type { BackupSongData, ConflictInfo } from '@shared/types'

export type ConflictStrategy = 'skip' | 'overwrite' | 'newCode'

export interface ImportResult {
  code: string
  order: number
  status: string
}

interface ImportModalProps {
  isOpen: boolean
  completed: boolean
  conflicts: ConflictInfo[]
  currentConflictIndex: number
  applyToAll: boolean
  results: ImportResult[]
  onApplyToAllChange: (value: boolean) => void
  onConflictResolution: (strategy: ConflictStrategy) => void
  onClose: () => void
}

export function ImportModal({
  isOpen,
  completed,
  conflicts,
  currentConflictIndex,
  applyToAll,
  results,
  onApplyToAllChange,
  onConflictResolution,
  onClose
}: ImportModalProps): JSX.Element | null {
  if (!isOpen) return null

  const currentConflict = conflicts[currentConflictIndex]
  const currentConflictSong = currentConflict?.backupItem as BackupSongData | undefined

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {completed ? '가져오기 완료' : '백업 가져오기'}
          </h3>
        </div>

        {/* 본문 */}
        <div className="p-6">
          {completed ? (
            /* 완료 화면 */
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                <CheckCircle className="w-8 h-8" />
                <span className="text-lg font-medium">가져오기가 완료되었습니다.</span>
              </div>
              <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-slate-600 dark:text-slate-300">찬양</th>
                      <th className="px-4 py-2 text-left text-slate-600 dark:text-slate-300">결과</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, idx) => (
                      <tr key={idx} className="border-t border-slate-100 dark:border-slate-700">
                        <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                          {result.code}{result.order}
                        </td>
                        <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                          {result.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : conflicts.length > 0 && currentConflictSong ? (
            /* 충돌 해결 화면 */
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6" />
                <span className="font-medium">
                  충돌 발생 ({currentConflictIndex + 1}/{conflicts.length})
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3">
                <p className="text-slate-700 dark:text-slate-300">
                  <span className="font-mono font-semibold text-primary-600 dark:text-primary-400">
                    {currentConflictSong.code}{currentConflictSong.order}
                  </span>
                  이(가) 이미 존재합니다.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">기존</p>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {(currentConflict.existingItem as { title?: string })?.title || '제목 없음'}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-primary-200 dark:border-primary-600">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">백업</p>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {currentConflictSong.title}
                    </p>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToAll}
                  onChange={(e) => onApplyToAllChange(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  이후 모든 충돌에 이 선택 적용
                </span>
              </label>
            </div>
          ) : (
            /* 로딩 화면 */
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          {completed ? (
            <div className="flex justify-end">
              <Button onClick={onClose}>닫기</Button>
            </div>
          ) : conflicts.length > 0 ? (
            <div className="flex justify-between">
              <Button variant="ghost" onClick={onClose}>
                취소
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => onConflictResolution('skip')}>
                  건너뛰기
                </Button>
                <Button variant="secondary" onClick={() => onConflictResolution('overwrite')}>
                  덮어쓰기
                </Button>
                <Button onClick={() => onConflictResolution('newCode')}>
                  새 코드로 추가
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button variant="ghost" onClick={onClose}>
                취소
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
