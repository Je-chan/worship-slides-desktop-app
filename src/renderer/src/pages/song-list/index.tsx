import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
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
  const [songs, setSongs] = useState<Song[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('group')
  const [sortBy, setSortBy] = useState<SortBy>('code')
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

    // 태그 필터링
    if (selectedTagIds.length > 0) {
      result = result.filter((song) => {
        const songTags = songTagMap[song.id] || []
        const songTagIds = songTags.map((t) => t.id)
        return selectedTagIds.every((tagId) => songTagIds.includes(tagId))
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

  const groupCodes = Object.keys(groupedSongs).sort()

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
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">찬양 목록</h1>
          <p className="mt-1 text-slate-600">
            총 {songs.length}개의 찬양이 등록되어 있습니다.
          </p>
        </div>
        <Link to="/songs/create">
          <Button>+ 새 찬양</Button>
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
            <span className="text-sm text-slate-600">태그 필터:</span>

            {/* 선택된 태그 (Badge) */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-primary-600 text-white"
                  >
                    {tag.name}
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="ml-1 hover:bg-primary-700 rounded-full p-0.5"
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
                <span className="text-sm text-slate-400">등록된 태그가 없습니다</span>
              ) : availableTags.length === 0 ? (
                <span className="text-sm text-slate-400">모든 태그가 선택되었습니다</span>
              ) : (
                availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => selectTag(tag.id)}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    {tag.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 뷰 모드 & 정렬 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">보기:</span>
              <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('group')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === 'group'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  그룹
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  리스트
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-sm ${viewMode === 'group' ? 'text-slate-400' : 'text-slate-600'}`}>
                정렬:
              </span>
              <div className={`flex rounded-lg border overflow-hidden ${viewMode === 'group' ? 'border-slate-200' : 'border-slate-300'}`}>
                <button
                  onClick={() => setSortBy('code')}
                  disabled={viewMode === 'group'}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === 'group'
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : sortBy === 'code'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  코드순
                </button>
                <button
                  onClick={() => setSortBy('title')}
                  disabled={viewMode === 'group'}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === 'group'
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : sortBy === 'title'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  제목순
                </button>
              </div>
              {viewMode === 'group' && (
                <span className="text-xs text-slate-400">(그룹 뷰는 코드순 고정)</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 검색 결과 없음 */}
      {filteredSongs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">검색 결과가 없습니다.</p>
        </div>
      )}

      {/* 그룹 뷰 */}
      {viewMode === 'group' && filteredSongs.length > 0 && (
        <div className="space-y-3">
          {groupCodes.map((code) => (
            <Disclosure key={code} defaultOpen>
              {({ open }) => (
                <Card>
                  <DisclosureButton className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 font-bold flex items-center justify-center">
                        {code}
                      </span>
                      <span className="font-medium text-slate-900">
                        {groupedSongs[code].length}개의 찬양
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </DisclosureButton>
                  <DisclosurePanel>
                    <div className="border-t border-slate-200">
                      {groupedSongs[code].map((song, index) => {
                        const songTags = songTagMap[song.id] || []
                        return (
                          <div
                            key={song.id}
                            className={`px-6 py-3 flex items-center justify-between hover:bg-slate-50 ${
                              index !== groupedSongs[code].length - 1 ? 'border-b border-slate-100' : ''
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="w-8 text-center font-mono text-sm text-slate-500">
                                {song.order}
                              </span>
                              <span className="text-slate-900">{song.title}</span>
                            </div>
                            {/* 태그 Badge */}
                            <div className="flex items-center gap-2">
                              {songTags.length > 0 ? (
                                songTags.map((tag) => (
                                  <span
                                    key={tag.id}
                                    className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
                                  >
                                    {tag.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400">태그 없음</span>
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
        <Card>
          <div className="divide-y divide-slate-200">
            {sortedSongs.map((song) => {
              const songTags = songTagMap[song.id] || []
              return (
                <div
                  key={song.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-8 rounded bg-primary-100 text-primary-700 font-mono text-sm font-medium flex items-center justify-center">
                      {song.code}{song.order}
                    </span>
                    <span className="text-slate-900">{song.title}</span>
                  </div>
                  {/* 태그 Badge */}
                  <div className="flex items-center gap-2">
                    {songTags.length > 0 ? (
                      songTags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
                        >
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">태그 없음</span>
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
