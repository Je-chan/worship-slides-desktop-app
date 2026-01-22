import { useState, useEffect } from 'react'
import { Button, Card, CardHeader, CardContent, Label, Input } from '@shared/ui'
import {
  SlideStyles,
  SlideTypeStyle,
  loadStyles,
  saveStyles,
  resetStyles,
  AVAILABLE_FONTS,
  FONT_WEIGHTS,
  getTextStyles,
  getBackgroundStyles,
  getOverlayStyles,
} from '@shared/lib/slideStyles'

type StyleTab = 'title' | 'lyrics'

export function SettingsPage(): JSX.Element {
  const [styles, setStyles] = useState<SlideStyles>(loadStyles())
  const [activeTab, setActiveTab] = useState<StyleTab>('title')
  const [saved, setSaved] = useState(false)

  // 스타일 변경 시 저장 표시 초기화
  useEffect(() => {
    setSaved(false)
  }, [styles])

  // 현재 탭의 스타일
  const currentStyle = styles[activeTab]

  // 텍스트 스타일 업데이트
  const updateTextStyle = <K extends keyof SlideTypeStyle['text']>(
    key: K,
    value: SlideTypeStyle['text'][K]
  ) => {
    setStyles((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        text: {
          ...prev[activeTab].text,
          [key]: value,
        },
      },
    }))
  }

  // 배경 스타일 업데이트
  const updateBackgroundStyle = <K extends keyof SlideTypeStyle['background']>(
    key: K,
    value: SlideTypeStyle['background'][K]
  ) => {
    setStyles((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        background: {
          ...prev[activeTab].background,
          [key]: value,
        },
      },
    }))
  }

  // 공통 스타일 업데이트
  const updateCommonStyle = <K extends keyof SlideStyles>(key: K, value: SlideStyles[K]) => {
    setStyles((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // 이미지 선택
  const handleSelectImage = async () => {
    const imagePath = await window.imageApi.select()
    if (imagePath) {
      updateBackgroundStyle('image', imagePath)
      updateBackgroundStyle('type', 'image')
    }
  }

  // 이미지 삭제
  const handleRemoveImage = async () => {
    if (currentStyle.background.image) {
      await window.imageApi.delete(currentStyle.background.image)
      updateBackgroundStyle('image', null)
      updateBackgroundStyle('type', 'color')
    }
  }

  // 저장
  const handleSave = () => {
    saveStyles(styles)
    setSaved(true)
  }

  // 초기화
  const handleReset = () => {
    const defaultStyles = resetStyles()
    setStyles(defaultStyles)
  }

  // 미리보기 텍스트
  const previewText = activeTab === 'title' ? '찬양 제목' : '주님의 사랑이\n나를 감싸네'

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            슬라이드 스타일
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            프레젠테이션 슬라이드의 디자인을 설정합니다.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleReset}>
            초기화
          </Button>
          <Button onClick={handleSave}>
            {saved ? '저장됨' : '저장'}
          </Button>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('title')}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'title'
              ? 'bg-primary-600 text-white shadow-lg'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          제목 슬라이드
        </button>
        <button
          onClick={() => setActiveTab('lyrics')}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'lyrics'
              ? 'bg-primary-600 text-white shadow-lg'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          가사 슬라이드
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 설정 패널 */}
        <div className="space-y-6">
          {/* 텍스트 설정 */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">텍스트 스타일</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 폰트 */}
              <div className="space-y-2">
                <Label>폰트</Label>
                <select
                  value={currentStyle.text.fontFamily}
                  onChange={(e) => updateTextStyle('fontFamily', e.target.value)}
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
                      value={currentStyle.text.fontSize}
                      onChange={(e) => updateTextStyle('fontSize', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm text-slate-600 dark:text-slate-400">
                      {currentStyle.text.fontSize}px
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>폰트 굵기</Label>
                  <select
                    value={currentStyle.text.fontWeight}
                    onChange={(e) => updateTextStyle('fontWeight', e.target.value)}
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
                    value={currentStyle.text.textColor}
                    onChange={(e) => updateTextStyle('textColor', e.target.value)}
                    className="w-12 h-10 rounded-lg cursor-pointer"
                  />
                  <Input
                    value={currentStyle.text.textColor}
                    onChange={(e) => updateTextStyle('textColor', e.target.value)}
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
                      onClick={() => updateTextStyle('textAlign', align)}
                      className={`flex-1 py-2 rounded-lg border transition-all ${
                        currentStyle.text.textAlign === align
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
                    value={currentStyle.text.lineHeight}
                    onChange={(e) => updateTextStyle('lineHeight', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-12 text-sm text-slate-600 dark:text-slate-400">
                    {currentStyle.text.lineHeight.toFixed(1)}
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
                      checked={currentStyle.text.textShadow}
                      onChange={(e) => updateTextStyle('textShadow', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">그림자</span>
                    {currentStyle.text.textShadow && (
                      <input
                        type="color"
                        value={currentStyle.text.textShadowColor}
                        onChange={(e) => updateTextStyle('textShadowColor', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                    )}
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentStyle.text.textStroke}
                      onChange={(e) => updateTextStyle('textStroke', e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">외곽선</span>
                    {currentStyle.text.textStroke && (
                      <input
                        type="color"
                        value={currentStyle.text.textStrokeColor}
                        onChange={(e) => updateTextStyle('textStrokeColor', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                    )}
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 배경 설정 */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">배경 스타일</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 배경 타입 */}
              <div className="space-y-2">
                <Label>배경 타입</Label>
                <div className="flex gap-2">
                  {(['color', 'gradient', 'image'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => updateBackgroundStyle('type', type)}
                      className={`flex-1 py-2 rounded-lg border transition-all ${
                        currentStyle.background.type === type
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {type === 'color' ? '단색' : type === 'gradient' ? '그라데이션' : '이미지'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 단색 배경 */}
              {currentStyle.background.type === 'color' && (
                <div className="space-y-2">
                  <Label>배경 색상</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentStyle.background.color}
                      onChange={(e) => updateBackgroundStyle('color', e.target.value)}
                      className="w-12 h-10 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={currentStyle.background.color}
                      onChange={(e) => updateBackgroundStyle('color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {/* 그라데이션 배경 */}
              {currentStyle.background.type === 'gradient' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>시작 색상</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentStyle.background.gradientFrom}
                          onChange={(e) => updateBackgroundStyle('gradientFrom', e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer"
                        />
                        <Input
                          value={currentStyle.background.gradientFrom}
                          onChange={(e) => updateBackgroundStyle('gradientFrom', e.target.value)}
                          className="flex-1 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>끝 색상</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentStyle.background.gradientTo}
                          onChange={(e) => updateBackgroundStyle('gradientTo', e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer"
                        />
                        <Input
                          value={currentStyle.background.gradientTo}
                          onChange={(e) => updateBackgroundStyle('gradientTo', e.target.value)}
                          className="flex-1 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>방향</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {([
                        { value: 'to-b', label: '↓' },
                        { value: 'to-r', label: '→' },
                        { value: 'to-br', label: '↘' },
                        { value: 'to-bl', label: '↙' },
                      ] as const).map((dir) => (
                        <button
                          key={dir.value}
                          onClick={() => updateBackgroundStyle('gradientDirection', dir.value)}
                          className={`py-2 rounded-lg border text-lg transition-all ${
                            currentStyle.background.gradientDirection === dir.value
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {dir.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 이미지 배경 */}
              {currentStyle.background.type === 'image' && (
                <>
                  <div className="space-y-2">
                    <Label>배경 이미지</Label>
                    {currentStyle.background.image ? (
                      <div className="relative">
                        <img
                          src={currentStyle.background.image}
                          alt="배경"
                          className="w-full h-32 object-cover rounded-xl"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleSelectImage}
                        className="w-full py-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 hover:border-primary-400 hover:text-primary-500 transition-colors"
                      >
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        이미지 선택
                      </button>
                    )}
                  </div>
                  {currentStyle.background.image && (
                    <>
                      <div className="space-y-2">
                        <Label>오버레이 투명도</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={currentStyle.background.imageOverlay}
                            onChange={(e) => updateBackgroundStyle('imageOverlay', parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <span className="w-12 text-sm text-slate-600 dark:text-slate-400">
                            {currentStyle.background.imageOverlay}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>오버레이 색상</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={currentStyle.background.imageOverlayColor}
                            onChange={(e) => updateBackgroundStyle('imageOverlayColor', e.target.value)}
                            className="w-12 h-10 rounded-lg cursor-pointer"
                          />
                          <Input
                            value={currentStyle.background.imageOverlayColor}
                            onChange={(e) => updateBackgroundStyle('imageOverlayColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* 전환 효과 */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">전환 효과</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>전환 효과</Label>
                <div className="flex gap-2">
                  {(['none', 'fade', 'slide'] as const).map((transition) => (
                    <button
                      key={transition}
                      onClick={() => updateCommonStyle('transition', transition)}
                      className={`flex-1 py-2 rounded-lg border transition-all ${
                        styles.transition === transition
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {transition === 'none' ? '없음' : transition === 'fade' ? '페이드' : '슬라이드'}
                    </button>
                  ))}
                </div>
              </div>
              {styles.transition !== 'none' && (
                <div className="space-y-2">
                  <Label>전환 속도</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="100"
                      max="1000"
                      step="50"
                      value={styles.transitionDuration}
                      onChange={(e) => updateCommonStyle('transitionDuration', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-16 text-sm text-slate-600 dark:text-slate-400">
                      {styles.transitionDuration}ms
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 미리보기 */}
        <div className="space-y-4">
          <Card className="sticky top-6">
            <CardHeader>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">미리보기</h2>
            </CardHeader>
            <CardContent>
              <div
                className="relative aspect-video rounded-xl overflow-hidden shadow-2xl"
                style={getBackgroundStyles(currentStyle.background)}
              >
                {/* 이미지 오버레이 */}
                {getOverlayStyles(currentStyle.background) && (
                  <div
                    className="absolute inset-0"
                    style={getOverlayStyles(currentStyle.background)!}
                  />
                )}
                {/* 텍스트 */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <p
                    style={getTextStyles(currentStyle.text)}
                    className="whitespace-pre-wrap"
                  >
                    {previewText}
                  </p>
                </div>
              </div>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                {activeTab === 'title' ? '제목 슬라이드' : '가사 슬라이드'} 미리보기
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
