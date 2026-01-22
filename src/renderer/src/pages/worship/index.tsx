import { useState, useMemo } from 'react'
import { Button, Input, Card, CardHeader, CardContent, Label } from '@shared/ui'

interface PresentationSlide {
  songId: number
  songTitle: string
  songCode: string
  songOrder: number
  slideNumber: number
  content: string
}

interface ParsedSong {
  code: string
  order: number
  display: string
}

export function WorshipPage(): JSX.Element {
  const [songCodesInput, setSongCodesInput] = useState('')
  const [slides, setSlides] = useState<PresentationSlide[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFoundCodes, setNotFoundCodes] = useState<string[]>([])

  // 입력된 코드를 파싱하여 배열로 변환
  const parsedCodes = useMemo((): ParsedSong[] => {
    if (!songCodesInput.trim()) return []

    // 쉼표, 공백, 줄바꿈으로 구분
    const codes = songCodesInput
      .split(/[,\s\n]+/)
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length > 0)

    const result: ParsedSong[] = []
    for (const code of codes) {
      const match = code.match(/^([A-G])(\d+)$/)
      if (match) {
        result.push({
          code: match[1],
          order: parseInt(match[2], 10),
          display: `${match[1]}${match[2]}`
        })
      }
    }
    return result
  }, [songCodesInput])

  // 슬라이드 가져오기
  const handleLoadSlides = async () => {
    if (parsedCodes.length === 0) {
      setError('찬양 코드를 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError(null)
    setNotFoundCodes([])

    try {
      const songCodes = parsedCodes.map((p) => p.display)
      const loadedSlides = await window.presentationApi.getSlides(songCodes)

      if (loadedSlides.length === 0) {
        setError('입력한 찬양을 찾을 수 없습니다.')
        setSlides([])
        return
      }

      // 찾지 못한 코드 확인
      const foundCodes = new Set(loadedSlides.map((s) => `${s.songCode}${s.songOrder}`))
      const missing = songCodes.filter((code) => !foundCodes.has(code.toUpperCase()))
      setNotFoundCodes(missing)

      setSlides(loadedSlides)
    } catch (err) {
      console.error('슬라이드 로드 실패:', err)
      setError('슬라이드를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 슬라이드 쇼 시작
  const handleStartPresentation = async () => {
    if (slides.length === 0) {
      setError('먼저 슬라이드를 불러와주세요.')
      return
    }

    try {
      await window.presentationApi.open(slides)
    } catch (err) {
      console.error('프레젠테이션 시작 실패:', err)
      setError('프레젠테이션을 시작할 수 없습니다.')
    }
  }

  // 슬라이드를 찬양별로 그룹화
  const groupedSlides = useMemo(() => {
    const groups: { songCode: string; songOrder: number; songTitle: string; slides: PresentationSlide[] }[] = []
    let currentGroup: typeof groups[0] | null = null

    for (const slide of slides) {
      if (!currentGroup || currentGroup.songId !== slide.songId) {
        currentGroup = {
          songCode: slide.songCode,
          songOrder: slide.songOrder,
          songTitle: slide.songTitle,
          songId: slide.songId,
          slides: []
        } as typeof groups[0] & { songId: number }
        groups.push(currentGroup)
      }
      currentGroup.slides.push(slide)
    }

    return groups
  }, [slides])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">예배 준비</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          오늘 예배에 사용할 찬양 순서를 입력하고 슬라이드를 시작하세요.
        </p>
      </div>

      {/* 찬양 코드 입력 */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">찬양 순서 입력</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            찬양 코드를 순서대로 입력하세요. (예: C1, C2, A3, A4)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="songCodes">찬양 코드</Label>
            <Input
              id="songCodes"
              value={songCodesInput}
              onChange={(e) => setSongCodesInput(e.target.value)}
              placeholder="C1, C2, A3, A4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLoadSlides()
                }
              }}
            />
            <p className="text-xs text-slate-400">쉼표(,) 또는 공백으로 구분</p>
          </div>

          {/* 파싱된 코드 미리보기 */}
          {parsedCodes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {parsedCodes.map((code, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-mono text-sm font-medium"
                >
                  {code.display}
                </span>
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {notFoundCodes.length > 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              다음 찬양을 찾을 수 없습니다: {notFoundCodes.join(', ')}
            </p>
          )}

          <div className="flex gap-3">
            <Button onClick={handleLoadSlides} disabled={isLoading || parsedCodes.length === 0}>
              {isLoading ? '불러오는 중...' : '슬라이드 불러오기'}
            </Button>
            {slides.length > 0 && (
              <Button onClick={handleStartPresentation} variant="secondary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                슬라이드 쇼 시작
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 슬라이드 미리보기 */}
      {slides.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">슬라이드 미리보기</h2>
              <span className="text-sm px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-medium">
                총 {slides.length}개
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {groupedSlides.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 text-primary-700 dark:text-primary-300 font-mono text-sm font-bold">
                    {group.songCode}{group.songOrder}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{group.songTitle}</span>
                  <span className="text-sm text-slate-400">({group.slides.length}개)</span>
                </div>
                <div className="grid grid-cols-4 gap-3 pl-4">
                  {group.slides.map((slide, slideIndex) => {
                    // 전체 슬라이드에서의 인덱스 계산
                    const globalIndex = slides.findIndex(
                      (s) => s.songId === slide.songId && s.slideNumber === slide.slideNumber
                    )
                    return (
                      <div
                        key={slideIndex}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center">
                            {globalIndex + 1}
                          </span>
                          {slide.slideNumber === 1 && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 font-medium">
                              제목
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 whitespace-pre-wrap">
                          {slide.content}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 안내 */}
      <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
        <CardContent className="py-4">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">슬라이드 쇼 조작 방법</h3>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <li><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">→</kbd> 이전/다음 슬라이드</li>
            <li><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">Home</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">End</kbd> 처음/마지막 슬라이드</li>
            <li><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">숫자</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">Enter</kbd> 해당 번호 슬라이드로 이동</li>
            <li><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">F5</kbd> 전체 화면 모드</li>
            <li><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">ESC</kbd> 전체 화면 해제 / 슬라이드 쇼 종료</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
