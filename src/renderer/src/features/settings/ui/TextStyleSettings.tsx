import { Card, CardHeader, CardContent, Label, Input, NumberStepper, Select, SegmentedControl, Switch } from '@shared/ui'
import type { SlideTypeStyle } from '@shared/lib/slideStyles'
import { AVAILABLE_FONTS, FONT_WEIGHTS } from '@shared/lib/slideStyles'

interface TextStyleSettingsProps {
  style: SlideTypeStyle
  onUpdate: <K extends keyof SlideTypeStyle['text']>(
    key: K,
    value: SlideTypeStyle['text'][K]
  ) => void
}

const ALIGN_OPTIONS = [
  { value: 'left' as const, label: '왼쪽' },
  { value: 'center' as const, label: '가운데' },
  { value: 'right' as const, label: '오른쪽' }
]

export function TextStyleSettings({ style, onUpdate }: TextStyleSettingsProps): JSX.Element {
  const fontOptions = AVAILABLE_FONTS.map((font) => ({
    value: font.value,
    label: font.name
  }))

  const weightOptions = FONT_WEIGHTS.map((weight) => ({
    value: weight.value,
    label: weight.name
  }))

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">텍스트 스타일</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 폰트 */}
        <div className="space-y-2">
          <Label>폰트</Label>
          <Select
            value={style.text.fontFamily}
            onChange={(value) => onUpdate('fontFamily', value)}
            options={fontOptions}
          />
        </div>

        {/* 폰트 크기 & 굵기 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>폰트 크기</Label>
            <NumberStepper
              value={style.text.fontSize}
              onChange={(v) => onUpdate('fontSize', v)}
              min={24}
              max={120}
              step={1}
              unit="px"
            />
          </div>
          <div className="space-y-2">
            <Label>폰트 굵기</Label>
            <Select
              value={style.text.fontWeight}
              onChange={(value) => onUpdate('fontWeight', value)}
              options={weightOptions}
            />
          </div>
        </div>

        {/* 텍스트 색상 */}
        <div className="space-y-2">
          <Label>텍스트 색상</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={style.text.textColor}
              onChange={(e) => onUpdate('textColor', e.target.value)}
              className="w-12 h-10 rounded-lg cursor-pointer"
            />
            <Input
              value={style.text.textColor}
              onChange={(e) => onUpdate('textColor', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {/* 정렬 */}
        <div className="space-y-2">
          <Label>정렬</Label>
          <SegmentedControl
            value={style.text.textAlign}
            onChange={(value) => onUpdate('textAlign', value)}
            options={ALIGN_OPTIONS}
          />
        </div>

        {/* 줄 간격 */}
        <div className="space-y-2">
          <Label>줄 간격</Label>
          <NumberStepper
            value={style.text.lineHeight}
            onChange={(v) => onUpdate('lineHeight', v)}
            min={1}
            max={2.5}
            step={0.1}
          />
        </div>

        {/* 텍스트 효과 */}
        <div className="space-y-3">
          <Label>텍스트 효과</Label>
          <div className="space-y-3">
            <Switch
              checked={style.text.textShadow}
              onChange={(checked) => onUpdate('textShadow', checked)}
              label="그림자"
            >
              {style.text.textShadow && (
                <input
                  type="color"
                  value={style.text.textShadowColor}
                  onChange={(e) => onUpdate('textShadowColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
              )}
            </Switch>
            <Switch
              checked={style.text.textStroke}
              onChange={(checked) => onUpdate('textStroke', checked)}
              label="외곽선"
            >
              {style.text.textStroke && (
                <input
                  type="color"
                  value={style.text.textStrokeColor}
                  onChange={(e) => onUpdate('textStrokeColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
              )}
            </Switch>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
