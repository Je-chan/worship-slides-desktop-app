import { useState, useEffect } from 'react'
import { Button } from '@shared/ui'
import {
  SlideStyles,
  SlideTypeStyle,
  loadStyles,
  saveStyles,
  resetStyles
} from '@shared/lib/slideStyles'
import type { BackupSongData, BackupData } from '@shared/types'
import {
  TextStyleSettings,
  BackgroundStyleSettings,
  TransitionSettings,
  StylePreview,
  BackupSettings,
  ImportModal,
  type ConflictStrategy,
  type ImportResult
} from '@features/settings'

type StyleTab = 'title' | 'lyrics'

interface ImportState {
  isImporting: boolean
  backupData: BackupData | null
  conflicts: Array<{
    backupItem: BackupSongData
    existingItem: { title?: string }
  }>
  currentConflictIndex: number
  applyToAll: boolean
  applyToAllStrategy: ConflictStrategy | null
  results: ImportResult[]
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
    completed: false
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
          [key]: value
        }
      }
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
          [key]: value
        }
      }
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
          conflicts: (result.conflicts || []) as ImportState['conflicts'],
          currentConflictIndex: 0,
          applyToAll: false,
          applyToAllStrategy: null,
          results: [],
          completed: false
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
    const results: ImportResult[] = []

    // 태그 먼저 가져오기
    await window.backupApi.importTags(backupData.tags)

    // 모든 찬양 가져오기
    for (const song of backupData.songs) {
      const result = await window.backupApi.importSong(song, 'skip')
      results.push({
        code: song.code,
        order: song.order,
        status: result.success ? '추가됨' : '건너뜀'
      })
    }

    setImportState((prev) => ({
      ...prev,
      results,
      completed: true
    }))
  }

  // 충돌 해결 처리
  const handleConflictResolution = async (strategy: ConflictStrategy) => {
    const { backupData, conflicts, currentConflictIndex, applyToAll } = importState

    if (!backupData) return

    // 현재 충돌 항목 처리
    const conflict = conflicts[currentConflictIndex]
    const songData = conflict.backupItem

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

    const newResults: ImportResult[] = [
      ...importState.results,
      { code: songData.code, order: songData.order, status }
    ]

    // "모든 항목에 적용" 체크된 경우
    if (applyToAll) {
      // 나머지 충돌 항목들도 같은 전략으로 처리
      for (let i = currentConflictIndex + 1; i < conflicts.length; i++) {
        const nextConflict = conflicts[i]
        const nextSongData = nextConflict.backupItem
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
      const conflictCodes = new Set(
        conflicts.map((c) => `${c.backupItem.code}${c.backupItem.order}`)
      )
      for (const song of backupData.songs) {
        const key = `${song.code}${song.order}`
        if (!conflictCodes.has(key)) {
          const importResult = await window.backupApi.importSong(song, 'skip')
          newResults.push({
            code: song.code,
            order: song.order,
            status: importResult.success ? '추가됨' : '건너뜀'
          })
        }
      }

      // 태그 가져오기
      await window.backupApi.importTags(backupData.tags)

      setImportState((prev) => ({
        ...prev,
        results: newResults,
        completed: true
      }))
    } else {
      // 다음 충돌로 이동
      const nextIndex = currentConflictIndex + 1
      if (nextIndex >= conflicts.length) {
        // 모든 충돌 처리 완료 - 나머지 항목 가져오기
        const conflictCodes = new Set(
          conflicts.map((c) => `${c.backupItem.code}${c.backupItem.order}`)
        )
        for (const song of backupData.songs) {
          const key = `${song.code}${song.order}`
          if (!conflictCodes.has(key)) {
            const importResult = await window.backupApi.importSong(song, 'skip')
            newResults.push({
              code: song.code,
              order: song.order,
              status: importResult.success ? '추가됨' : '건너뜀'
            })
          }
        }

        // 태그 가져오기
        await window.backupApi.importTags(backupData.tags)

        setImportState((prev) => ({
          ...prev,
          results: newResults,
          completed: true
        }))
      } else {
        setImportState((prev) => ({
          ...prev,
          results: newResults,
          currentConflictIndex: nextIndex
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
      completed: false
    })
  }

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
          <Button onClick={handleSave}>{saved ? '저장됨' : '저장'}</Button>
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
          <TextStyleSettings style={currentStyle} onUpdate={updateTextStyle} />

          <BackgroundStyleSettings
            style={currentStyle}
            onUpdate={updateBackgroundStyle}
            onSelectImage={handleSelectImage}
            onRemoveImage={handleRemoveImage}
          />

          <TransitionSettings
            transition={styles.transition}
            transitionDuration={styles.transitionDuration}
            onTransitionChange={(value) =>
              setStyles((prev) => ({ ...prev, transition: value }))
            }
            onDurationChange={(value) =>
              setStyles((prev) => ({ ...prev, transitionDuration: value }))
            }
          />
        </div>

        {/* 미리보기 */}
        <div className="space-y-4">
          <StylePreview
            style={currentStyle}
            previewText={previewText}
            label={activeTab === 'title' ? '제목 슬라이드' : '가사 슬라이드'}
          />
        </div>
      </div>

      {/* 데이터 백업/복원 */}
      <BackupSettings
        isExporting={isExporting}
        onExport={handleExport}
        onImport={handleImportStart}
      />

      {/* 가져오기 모달 */}
      <ImportModal
        isOpen={importState.isImporting}
        completed={importState.completed}
        conflicts={importState.conflicts}
        currentConflictIndex={importState.currentConflictIndex}
        applyToAll={importState.applyToAll}
        results={importState.results}
        onApplyToAllChange={(value) =>
          setImportState((prev) => ({ ...prev, applyToAll: value }))
        }
        onConflictResolution={handleConflictResolution}
        onClose={handleCloseImport}
      />
    </div>
  )
}
