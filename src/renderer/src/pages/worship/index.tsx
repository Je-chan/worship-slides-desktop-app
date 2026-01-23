import { useState, useMemo, useEffect, useRef } from 'react'
import { PlayCircle, Search } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardContent, Label, PageHeader, CodeBadge, LoadingSpinner } from '@shared/ui'
import type { PresentationSlide, ParsedSongCode, Song } from '@shared/types'

export function WorshipPage(): JSX.Element {
  const [songCodesInput, setSongCodesInput] = useState('')
  const [slides, setSlides] = useState<PresentationSlide[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFoundCodes, setNotFoundCodes] = useState<string[]>([])
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // 찬양 검색 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [allSongs, setAllSongs] = useState<Song[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // 모든 찬양 목록 로드
  useEffect(() => {
    window.songApi.getAll().then(setAllSongs)
  }, [])

  // 검색 결과 필터링
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return allSongs
      .filter((song) => song.title.toLowerCase().includes(query))
      .slice(0, 10) // 최대 10개
  }, [searchQuery, allSongs])

  // 검색 결과에서 찬양 선택
  const handleSelectSong = (song: Song) => {
    const code = `${song.code}${song.order}`
    setSongCodesInput((prev) => {
      if (!prev.trim()) return code
      return `${prev}, ${code}`
    })
    setSearchQuery('')
  }

  // 입력된 코드를 파싱하여 배열로 변환
  const parsedCodes = useMemo((): ParsedSongCode[] => {
    if (!songCodesInput.trim()) return []

    // 쉼표, 공백, 줄바꿈으로 구분
    const codes = songCodesInput
      .split(/[,\s\n]+/)
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length > 0)

    const result: ParsedSongCode[] = []
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

  // 코드가 변경되면 자동으로 슬라이드 로드 (디바운스 적용)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (parsedCodes.length === 0) {
      setSlides([])
      setError(null)
      setNotFoundCodes([])
      return
    }

    debounceRef.current = setTimeout(async () => {
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
      } catch {
        setError('슬라이드를 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }, 500) // 500ms 디바운스

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [parsedCodes])

  // 슬라이드 쇼 시작
  const handleStartPresentation = async () => {
    if (slides.length === 0) {
      setError('슬라이드가 없습니다. 찬양 코드를 확인해주세요.')
      return
    }

    try {
      await window.presentationApi.open(slides)
    } catch {
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
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={PlayCircle}
        title="예배 준비"
        description="오늘 예배에 사용할 찬양 순서를 입력하고 슬라이드를 시작하세요."
      />

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
            />
            <p className="text-xs text-slate-400">쉼표(,) 또는 공백으로 구분</p>
          </div>

          {/* 찬양 검색 */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              <Search className="w-4 h-4" />
              {isSearchOpen ? '검색 닫기' : '제목으로 검색'}
            </button>

            {isSearchOpen && (
              <div className="space-y-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="찬양 제목을 입력하세요..."
                />
                {searchResults.length > 0 && (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    {searchResults.map((song) => (
                      <button
                        key={song.id}
                        type="button"
                        onClick={() => handleSelectSong(song)}
                        className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors"
                      >
                        <span className="text-sm text-slate-700 dark:text-slate-300">{song.title}</span>
                        <CodeBadge code={song.code} order={song.order} />
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.trim() && searchResults.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    검색 결과가 없습니다.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 파싱된 코드 미리보기 */}
          {parsedCodes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {parsedCodes.map((code, index) => (
                <CodeBadge key={index} code={code.code} order={code.order} />
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

          <Button
            onClick={handleStartPresentation}
            disabled={isLoading || slides.length === 0 || notFoundCodes.length > 0}
          >
            <PlayCircle className="w-4 h-4" />
            {isLoading ? '불러오는 중...' : '슬라이드 쇼 시작'}
          </Button>
        </CardContent>
      </Card>

      {/* 로딩 상태 */}
      {isLoading && <LoadingSpinner message="슬라이드를 불러오는 중..." />}

      {/* 슬라이드 미리보기 */}
      {!isLoading && slides.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">슬라이드 미리보기</h2>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r from-primary-100 to-primary-200/80 dark:from-primary-800/40 dark:to-primary-900/40 text-primary-700 dark:text-primary-300 font-semibold shadow-sm">
                총 {slides.length}개
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {groupedSlides.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3">
                <div className="flex items-center gap-3">
                  <CodeBadge code={group.songCode} order={group.songOrder} />
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
                        className="p-3 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-100/80 dark:border-slate-700/50 shadow-sm shadow-slate-200/50 dark:shadow-slate-900/30 transition-all duration-150 hover:shadow hover:border-slate-200 dark:hover:border-slate-600"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-100 to-slate-200/80 dark:from-slate-700/80 dark:to-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center shadow-sm">
                            {globalIndex + 1}
                          </span>
                          {slide.slideNumber === 1 && (
                            <span className="text-xs px-1.5 py-0.5 rounded-md bg-primary-100/80 dark:bg-primary-800/40 text-primary-700 dark:text-primary-300 font-medium">
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
