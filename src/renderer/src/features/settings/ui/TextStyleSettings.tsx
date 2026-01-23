import { Card, CardHeader, CardContent, Label, Input } from '@shared/ui'
import type { SlideTypeStyle } from '@shared/lib/slideStyles'
import { AVAILABLE_FONTS, FONT_WEIGHTS } from '@shared/lib/slideStyles'

interface TextStyleSettingsProps {
  style: SlideTypeStyle
  onUpdate: <K extends keyof SlideTypeStyle['text']>(
    key: K,
    value: SlideTypeStyle['text'][K]
  ) => void
}

export function TextStyleSettings({ style, onUpdate }: TextStyleSettingsProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">텍스트 스타일</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 폰트 */}
        <div className="space-y-2">
          <Label>폰트</Label>
          <select
            value={style.text.fontFamily}
            onChange={(e) => onUpdate('fontFamily', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
          >
            {AVAILABLE_FONTS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.name}
              </option>
            ))}
          </select>
        </div>

        {/* 폰트 크기 & 굵기 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>폰트 크기</Label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="24"
                max="120"
                value={style.text.fontSize}
                onChange={(e) => onUpdate('fontSize', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-sm text-slate-600 dark:text-slate-400">
                {style.text.fontSize}px
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>폰트 굵기</Label>
            <select
              value={style.text.fontWeight}
              onChange={(e) => onUpdate('fontWeight', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
            >
              {FONT_WEIGHTS.map((weight) => (
                <option key={weight.value} value={weight.value}>
                  {weight.name}
                </option>
              ))}
            </select>
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
          <div className="flex gap-2">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                onClick={() => onUpdate('textAlign', align)}
                className={`flex-1 py-2 rounded-lg border transition-all ${
                  style.text.textAlign === align
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                }`}
              >
                {align === 'left' ? '왼쪽' : align === 'center' ? '가운데' : '오른쪽'}
              </button>
            ))}
          </div>
        </div>

        {/* 줄 간격 */}
        <div className="space-y-2">
          <Label>줄 간격</Label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.1"
              value={style.text.lineHeight}
              onChange={(e) => onUpdate('lineHeight', parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-sm text-slate-600 dark:text-slate-400">
              {style.text.lineHeight.toFixed(1)}
            </span>
          </div>
        </div>

        {/* 텍스트 효과 */}
        <div className="space-y-3">
          <Label>텍스트 효과</Label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={style.text.textShadow}
                onChange={(e) => onUpdate('textShadow', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">그림자</span>
              {style.text.textShadow && (
                <input
                  type="color"
                  value={style.text.textShadowColor}
                  onChange={(e) => onUpdate('textShadowColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
              )}
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={style.text.textStroke}
                onChange={(e) => onUpdate('textStroke', e.target.checked)}
                className="w-5 h-5 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">외곽선</span>
              {style.text.textStroke && (
                <input
                  type="color"
                  value={style.text.textStrokeColor}
                  onChange={(e) => onUpdate('textStrokeColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
              )}
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
