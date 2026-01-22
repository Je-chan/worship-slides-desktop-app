import { useState, useEffect } from 'react'
import { X, ImagePlus, CheckCircle, AlertTriangle } from 'lucide-react'
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
import type { BackupSongData, ConflictInfo, BackupData } from 'src/preload/index.d'

type StyleTab = 'title' | 'lyrics'
type ConflictStrategy = 'skip' | 'overwrite' | 'newCode'

interface ImportState {
  isImporting: boolean
  backupData: BackupData | null
  conflicts: ConflictInfo[]
  currentConflictIndex: number
  applyToAll: boolean
  applyToAllStrategy: ConflictStrategy | null
  results: Array<{ code: string; order: number; status: string }>
  completed: boolean
}

export function SettingsPage(): JSX.Element {
  const [styles, setStyles] = useState<SlideStyles>(loadStyles())
  const [activeTab, setActiveTab] = useState<StyleTab>('title')
  const [saved, setSaved] = useState(false)

  // Backup state
  const [isExporting, setIsExporting] = useState(false)
  const [importState, setImportState] = useState<ImportState>({
    isImporting: false,
    backupData: null,
    conflicts: [],
    currentConflictIndex: 0,
    applyToAll: false,
    applyToAllStrategy: null,
    results: [],
    completed: false,
  })

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

  // ===== Backup Functions =====

  // 백업 내보내기
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const result = await window.backupApi.export()
      if (result.success) {
        alert(`백업이 완료되었습니다.\n${result.filePath}`)
      } else if (!result.canceled) {
        alert(`백업 실패: ${result.error}`)
      }
    } catch (error) {
      alert(`백업 중 오류 발생: ${error}`)
    } finally {
      setIsExporting(false)
    }
  }

  // 백업 파일 읽기
  const handleImportStart = async () => {
    try {
      const result = await window.backupApi.read()
      if (result.success && result.backupData) {
        setImportState({
          isImporting: true,
          backupData: result.backupData,
          conflicts: result.conflicts || [],
          currentConflictIndex: 0,
          applyToAll: false,
          applyToAllStrategy: null,
          results: [],
          completed: false,
        })

        // 충돌이 없으면 바로 가져오기 진행
        if (!result.conflicts || result.conflicts.length === 0) {
          await processImportWithoutConflicts(result.backupData)
        }
      } else if (!result.canceled) {
        alert(result.error || '백업 파일을 읽을 수 없습니다.')
      }
    } catch (error) {
      alert(`파일 읽기 중 오류 발생: ${error}`)
    }
  }

  // 충돌 없이 가져오기
  const processImportWithoutConflicts = async (backupData: BackupData) => {
    const results: Array<{ code: string; order: number; status: string }> = []

    // 태그 먼저 가져오기
    await window.backupApi.importTags(backupData.tags)

    // 모든 찬양 가져오기
    for (const song of backupData.songs) {
      const result = await window.backupApi.importSong(song, 'skip')
      results.push({
        code: song.code,
        order: song.order,
        status: result.success ? '추가됨' : '건너뜀',
      })
    }

    setImportState((prev) => ({
      ...prev,
      results,
      completed: true,
    }))
  }

  // 충돌 해결 처리
  const handleConflictResolution = async (strategy: ConflictStrategy) => {
    const { backupData, conflicts, currentConflictIndex, applyToAll } = importState

    if (!backupData) return

    // 현재 충돌 항목 처리
    const conflict = conflicts[currentConflictIndex]
    const songData = conflict.backupItem as BackupSongData

    const result = await window.backupApi.importSong(songData, strategy)

    let status = ''
    if (strategy === 'skip') {
      status = '건너뜀'
    } else if (strategy === 'overwrite') {
      status = '덮어씀'
    } else if (result.newOrder) {
      status = `${songData.code}${result.newOrder}로 추가됨`
    } else {
      status = '추가됨'
    }

    const newResults = [
      ...importState.results,
      { code: songData.code, order: songData.order, status },
    ]

    // "모든 항목에 적용" 체크된 경우
    if (applyToAll) {
      // 나머지 충돌 항목들도 같은 전략으로 처리
      for (let i = currentConflictIndex + 1; i < conflicts.length; i++) {
        const nextConflict = conflicts[i]
        const nextSongData = nextConflict.backupItem as BackupSongData
        const nextResult = await window.backupApi.importSong(nextSongData, strategy)

        let nextStatus = ''
        if (strategy === 'skip') {
          nextStatus = '건너뜀'
        } else if (strategy === 'overwrite') {
          nextStatus = '덮어씀'
        } else if (nextResult.newOrder) {
          nextStatus = `${nextSongData.code}${nextResult.newOrder}로 추가됨`
        } else {
          nextStatus = '추가됨'
        }

        newResults.push({ code: nextSongData.code, order: nextSongData.order, status: nextStatus })
      }

      // 충돌 없는 항목들도 가져오기
      const conflictCodes = new Set(conflicts.map((c) => `${(c.backupItem as BackupSongData).code}${(c.backupItem as BackupSongData).order}`))
      for (const song of backupData.songs) {
        const key = `${song.code}${song.order}`
        if (!conflictCodes.has(key)) {
          const importResult = await window.backupApi.importSong(song, 'skip')
          newResults.push({
            code: song.code,
            order: song.order,
            status: importResult.success ? '추가됨' : '건너뜀',
          })
        }
      }

      // 태그 가져오기
      await window.backupApi.importTags(backupData.tags)

      setImportState((prev) => ({
        ...prev,
        results: newResults,
        completed: true,
      }))
    } else {
      // 다음 충돌로 이동
      const nextIndex = currentConflictIndex + 1
      if (nextIndex >= conflicts.length) {
        // 모든 충돌 처리 완료 - 나머지 항목 가져오기
        const conflictCodes = new Set(conflicts.map((c) => `${(c.backupItem as BackupSongData).code}${(c.backupItem as BackupSongData).order}`))
        for (const song of backupData.songs) {
          const key = `${song.code}${song.order}`
          if (!conflictCodes.has(key)) {
            const importResult = await window.backupApi.importSong(song, 'skip')
            newResults.push({
              code: song.code,
              order: song.order,
              status: importResult.success ? '추가됨' : '건너뜀',
            })
          }
        }

        // 태그 가져오기
        await window.backupApi.importTags(backupData.tags)

        setImportState((prev) => ({
          ...prev,
          results: newResults,
          completed: true,
        }))
      } else {
        setImportState((prev) => ({
          ...prev,
          results: newResults,
          currentConflictIndex: nextIndex,
        }))
      }
    }
  }

  // 가져오기 모달 닫기
  const handleCloseImport = () => {
    setImportState({
      isImporting: false,
      backupData: null,
      conflicts: [],
      currentConflictIndex: 0,
      applyToAll: false,
      applyToAllStrategy: null,
      results: [],
      completed: false,
    })
  }

  // 현재 충돌 항목
  const currentConflict = importState.conflicts[importState.currentConflictIndex]
  const currentConflictSong = currentConflict?.backupItem as BackupSongData | undefined

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
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleSelectImage}
                        className="w-full py-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 hover:border-primary-400 hover:text-primary-500 transition-colors"
                      >
                        <ImagePlus className="w-8 h-8 mx-auto mb-2" />
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

      {/* 데이터 백업/복원 */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">데이터 백업/복원</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            찬양 데이터를 백업하거나 다른 기기에서 내보낸 백업 파일을 가져올 수 있습니다.
          </p>
          <div className="flex gap-3">
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? '내보내는 중...' : '백업 내보내기'}
            </Button>
            <Button variant="secondary" onClick={handleImportStart}>
              백업 가져오기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 가져오기 모달 */}
      {importState.isImporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
            {/* 헤더 */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {importState.completed ? '가져오기 완료' : '백업 가져오기'}
              </h3>
            </div>

            {/* 본문 */}
            <div className="p-6">
              {importState.completed ? (
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
                        {importState.results.map((result, idx) => (
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
              ) : importState.conflicts.length > 0 && currentConflictSong ? (
                /* 충돌 해결 화면 */
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-6 h-6" />
                    <span className="font-medium">
                      충돌 발생 ({importState.currentConflictIndex + 1}/{importState.conflicts.length})
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
                      checked={importState.applyToAll}
                      onChange={(e) => setImportState((prev) => ({ ...prev, applyToAll: e.target.checked }))}
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
              {importState.completed ? (
                <div className="flex justify-end">
                  <Button onClick={handleCloseImport}>닫기</Button>
                </div>
              ) : importState.conflicts.length > 0 ? (
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={handleCloseImport}>
                    취소
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => handleConflictResolution('skip')}>
                      건너뛰기
                    </Button>
                    <Button variant="secondary" onClick={() => handleConflictResolution('overwrite')}>
                      덮어쓰기
                    </Button>
                    <Button onClick={() => handleConflictResolution('newCode')}>
                      새 코드로 추가
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <Button variant="ghost" onClick={handleCloseImport}>
                    취소
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
