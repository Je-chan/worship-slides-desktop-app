import { Card, CardHeader, CardContent, Label, NumberStepper, SegmentedControl } from '@shared/ui'
import type { SlideStyles } from '@shared/lib/slideStyles'

interface TransitionSettingsProps {
  transition: SlideStyles['transition']
  transitionDuration: SlideStyles['transitionDuration']
  onTransitionChange: (value: SlideStyles['transition']) => void
  onDurationChange: (value: number) => void
}

const TRANSITION_OPTIONS = [
  { value: 'none' as const, label: '없음' },
  { value: 'fade' as const, label: '페이드' },
  { value: 'slide' as const, label: '슬라이드' }
]

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
          <SegmentedControl
            value={transition}
            onChange={onTransitionChange}
            options={TRANSITION_OPTIONS}
          />
        </div>
        {transition !== 'none' && (
          <div className="space-y-2">
            <Label>전환 속도</Label>
            <NumberStepper
              value={transitionDuration}
              onChange={onDurationChange}
              min={100}
              max={1000}
              step={50}
              unit="ms"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
