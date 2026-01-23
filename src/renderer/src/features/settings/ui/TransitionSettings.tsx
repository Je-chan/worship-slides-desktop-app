import { Card, CardHeader, CardContent, Label } from '@shared/ui'
import type { SlideStyles } from '@shared/lib/slideStyles'

interface TransitionSettingsProps {
  transition: SlideStyles['transition']
  transitionDuration: SlideStyles['transitionDuration']
  onTransitionChange: (value: SlideStyles['transition']) => void
  onDurationChange: (value: number) => void
}

export function TransitionSettings({
  transition,
  transitionDuration,
  onTransitionChange,
  onDurationChange
}: TransitionSettingsProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">전환 효과</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>전환 효과</Label>
          <div className="flex gap-2">
            {(['none', 'fade', 'slide'] as const).map((t) => (
              <button
                key={t}
                onClick={() => onTransitionChange(t)}
                className={`flex-1 py-2 rounded-lg border transition-all ${
                  transition === t
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                }`}
              >
                {t === 'none' ? '없음' : t === 'fade' ? '페이드' : '슬라이드'}
              </button>
            ))}
          </div>
        </div>
        {transition !== 'none' && (
          <div className="space-y-2">
            <Label>전환 속도</Label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={transitionDuration}
                onChange={(e) => onDurationChange(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="w-16 text-sm text-slate-600 dark:text-slate-400">
                {transitionDuration}ms
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
