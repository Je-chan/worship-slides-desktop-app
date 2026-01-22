import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Button, Input, Card, CardContent } from '@shared/ui'

type ViewMode = 'list' | 'group'
type SortBy = 'title' | 'code'

interface Song {
  id: number
  title: string
  code: string
  order: number
}

interface Tag {
  id: number
  name: string
}

export function SongListPage(): JSX.Element {
  const navigate = useNavigate()
  const [songs, setSongs] = useState<Song[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('group')
  const [sortBy, setSortBy] = useState<SortBy>('title')
  const [isLoading, setIsLoading] = useState(true)
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [songTagMap, setSongTagMap] = useState<Record<number, Tag[]>>({})

  // 찬양 및 태그 목록 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const [songsData, tagsData] = await Promise.all([
          window.songApi.getAll(),
          window.tagApi.getAll()
        ])
        setSongs(songsData)
        setTags(tagsData)

        // 각 찬양의 태그 매핑 로드 (태그 객체 전체 저장)
        const tagMap: Record<number, Tag[]> = {}
        for (const song of songsData) {
          const songTags = await window.songTagApi.getBySongId(song.id)
          tagMap[song.id] = songTags
        }
        setSongTagMap(tagMap)
      } catch (error) {
        console.error('데이터 로드 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // 검색 및 태그 필터링
  const filteredSongs = useMemo(() => {
    let result = songs

    // 태그 필터링 (OR 조건: 선택된 태그 중 하나라도 포함되면 표시)
    if (selectedTagIds.length > 0) {
      result = result.filter((song) => {
        const songTags = songTagMap[song.id] || []
        const songTagIds = songTags.map((t) => t.id)
        return selectedTagIds.some((tagId) => songTagIds.includes(tagId))
      })
    }

    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()

      // 코드+순서 패턴 매칭 (예: c1, C1, a3)
      const codeMatch = query.match(/^([a-z]+)(\d+)?$/i)
      if (codeMatch) {
        const [, code, order] = codeMatch
        result = result.filter((song) => {
          const matchCode = song.code.toLowerCase().startsWith(code.toLowerCase())
          if (order) {
            return matchCode && song.order === parseInt(order, 10)
          }
          return matchCode
        })
      } else {
        // 제목 검색
        result = result.filter((song) => song.title.toLowerCase().includes(query))
      }
    }

    return result
  }, [songs, searchQuery, selectedTagIds, songTagMap])

  // 정렬
  const sortedSongs = useMemo(() => {
    const sorted = [...filteredSongs]
    if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'))
    } else {
      sorted.sort((a, b) => {
        const codeCompare = a.code.localeCompare(b.code)
        if (codeCompare !== 0) return codeCompare
        return a.order - b.order
      })
    }
    return sorted
  }, [filteredSongs, sortBy])

  // 그룹핑 (코드별)
  const groupedSongs = useMemo(() => {
    const groups: Record<string, Song[]> = {}
    for (const song of sortedSongs) {
      if (!groups[song.code]) {
        groups[song.code] = []
      }
      groups[song.code].push(song)
    }
    // 그룹 내에서 order로 정렬
    for (const code of Object.keys(groups)) {
      groups[code].sort((a, b) => a.order - b.order)
    }
    return groups
  }, [sortedSongs])

  // 도레미파솔라시 순서로 정렬 (C, D, E, F, G, A, B)
  const CODE_ORDER = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  const groupCodes = Object.keys(groupedSongs).sort((a, b) => {
    const aIndex = CODE_ORDER.indexOf(a.toUpperCase())
    const bIndex = CODE_ORDER.indexOf(b.toUpperCase())
    return aIndex - bIndex
  })

  // 태그 선택 (아직 선택되지 않은 경우에만)
  const selectTag = (tagId: number) => {
    if (!selectedTagIds.includes(tagId)) {
      setSelectedTagIds((prev) => [...prev, tagId])
    }
  }

  // 태그 선택 해제
  const removeTag = (tagId: number) => {
    setSelectedTagIds((prev) => prev.filter((id) => id !== tagId))
  }

  // 선택된 태그 객체들
  const selectedTags = useMemo(() => {
    return tags.filter((tag) => selectedTagIds.includes(tag.id))
  }, [tags, selectedTagIds])

  // 선택 가능한 태그들 (아직 선택되지 않은 것들)
  const availableTags = useMemo(() => {
    return tags.filter((tag) => !selectedTagIds.includes(tag.id))
  }, [tags, selectedTagIds])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">찬양 목록</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            총 <span className="font-semibold text-primary-600 dark:text-primary-400">{songs.length}</span>개의 찬양이 등록되어 있습니다.
          </p>
        </div>
        <Link to="/songs/create">
          <Button>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 찬양
          </Button>
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="space-y-4">
          {/* 검색 */}
          <div>
            <Input
              placeholder="찬양 제목 또는 코드로 검색 (예: 사랑, C1, A)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 태그 필터 */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">태그 필터:</span>

            {/* 선택된 태그 (Badge) */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm"
                  >
                    {tag.name}
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 선택 가능한 태그 목록 */}
            <div className="flex flex-wrap gap-2">
              {availableTags.length === 0 && selectedTags.length === 0 ? (
                <span className="text-sm text-slate-400 italic">등록된 태그가 없습니다</span>
              ) : availableTags.length === 0 ? (
                <span className="text-sm text-slate-400 italic">모든 태그가 선택되었습니다</span>
              ) : (
                availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => selectTag(tag.id)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-slate-100 transition-all duration-200 shadow-sm"
                  >
                    {tag.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 뷰 모드 & 정렬 */}
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">보기:</span>
              <div className="flex rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden shadow-sm">
                <button
                  onClick={() => setViewMode('group')}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    viewMode === 'group'
                      ? 'bg-primary-600 text-white shadow-inner'
                      : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  그룹
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white shadow-inner'
                      : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  리스트
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${viewMode === 'group' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>
                정렬:
              </span>
              <div className={`flex rounded-xl border overflow-hidden shadow-sm ${viewMode === 'group' ? 'border-slate-100 dark:border-slate-700 opacity-60' : 'border-slate-200 dark:border-slate-600'}`}>
                <button
                  onClick={() => setSortBy('code')}
                  disabled={viewMode === 'group'}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    viewMode === 'group'
                      ? 'bg-slate-50 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
                      : sortBy === 'code'
                        ? 'bg-primary-600 text-white shadow-inner'
                        : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  코드순
                </button>
                <button
                  onClick={() => setSortBy('title')}
                  disabled={viewMode === 'group'}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    viewMode === 'group'
                      ? 'bg-slate-50 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
                      : sortBy === 'title'
                        ? 'bg-primary-600 text-white shadow-inner'
                        : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  제목순
                </button>
              </div>
              {viewMode === 'group' && (
                <span className="text-xs text-slate-400 italic">(그룹 뷰는 코드순 고정)</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 검색 결과 없음 */}
      {filteredSongs.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-slate-500 dark:text-slate-400">검색 결과가 없습니다.</p>
        </div>
      )}

      {/* 그룹 뷰 */}
      {viewMode === 'group' && filteredSongs.length > 0 && (
        <div className="space-y-4">
          {groupCodes.map((code) => (
            <Disclosure key={code} defaultOpen>
              {({ open }) => (
                <Card className="overflow-hidden">
                  <DisclosureButton className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 text-primary-700 dark:text-primary-300 font-bold text-lg flex items-center justify-center shadow-sm">
                        {code}
                      </span>
                      <div className="text-left">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {groupedSongs[code].length}개의 찬양
                        </span>
                        <p className="text-sm text-slate-500 dark:text-slate-400">코드 {code} 그룹</p>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </DisclosureButton>
                  <DisclosurePanel>
                    <div className="border-t border-slate-100 dark:border-slate-700">
                      {groupedSongs[code].map((song, index) => {
                        const songTags = songTagMap[song.id] || []
                        return (
                          <div
                            key={song.id}
                            onClick={() => navigate(`/songs/${song.id}`)}
                            className={`px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${
                              index !== groupedSongs[code].length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 font-mono text-sm text-slate-600 dark:text-slate-300 font-medium flex items-center justify-center">
                                {song.order}
                              </span>
                              <span className="text-slate-800 dark:text-slate-200 font-medium">{song.title}</span>
                            </div>
                            {/* 태그 Badge */}
                            <div className="flex items-center gap-2">
                              {songTags.length > 0 ? (
                                songTags.map((tag) => (
                                  <span
                                    key={tag.id}
                                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                  >
                                    {tag.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400 italic">태그 없음</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </DisclosurePanel>
                </Card>
              )}
            </Disclosure>
          ))}
        </div>
      )}

      {/* 리스트 뷰 */}
      {viewMode === 'list' && filteredSongs.length > 0 && (
        <Card className="overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {sortedSongs.map((song) => {
              const songTags = songTagMap[song.id] || []
              return (
                <div
                  key={song.id}
                  onClick={() => navigate(`/songs/${song.id}`)}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-14 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 text-primary-700 dark:text-primary-300 font-mono text-sm font-bold flex items-center justify-center shadow-sm">
                      {song.code}{song.order}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{song.title}</span>
                  </div>
                  {/* 태그 Badge */}
                  <div className="flex items-center gap-2">
                    {songTags.length > 0 ? (
                      songTags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        >
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">태그 없음</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
