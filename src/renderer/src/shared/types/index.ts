/**
 * 공유 타입 정의
 * preload/index.d.ts의 타입을 re-export하고 renderer 전용 타입 추가
 */

// ===== 기본 엔티티 타입 =====

/** 찬양 */
export interface Song {
  id: number
  title: string
  code: string
  order: number
}

/** 슬라이드 */
export interface Slide {
  id: number
  song_id: number
  slide_number: number
  content: string
}

/** 태그 */
export interface Tag {
  id: number
  name: string
}

/** 프레젠테이션 슬라이드 (찬양 정보 포함) */
export interface PresentationSlide {
  songId: number
  songTitle: string
  songCode: string
  songOrder: number
  slideNumber: number
  content: string
}

// ===== 확장 타입 =====

/** 태그가 포함된 찬양 */
export interface SongWithTags extends Song {
  tags: Tag[]
}

/** 슬라이드가 포함된 찬양 */
export interface SongWithSlides extends Song {
  slides: Slide[]
}

/** 찬양 코드 파싱 결과 */
export interface ParsedSongCode {
  code: string
  order: number
  display: string
}

// ===== 백업 관련 타입 =====

/** 백업용 찬양 데이터 */
export interface BackupSongData {
  title: string
  code: string
  order: number
  slides: Array<{ slideNumber: number; content: string }>
  tags: string[]
}

/** 백업 데이터 */
export interface BackupData {
  version: number
  exportedAt: string
  songs: BackupSongData[]
  tags: string[]
}

/** 충돌 정보 */
export interface ConflictInfo {
  type: 'song' | 'tag'
  backupItem: BackupSongData | string
  existingItem: Song | Tag | null
  code?: string
  order?: number
}

// ===== API 결과 타입 =====

/** 백업 내보내기 결과 */
export interface BackupExportResult {
  success: boolean
  canceled?: boolean
  filePath?: string
  error?: string
}

/** 백업 읽기 결과 */
export interface BackupReadResult {
  success: boolean
  canceled?: boolean
  error?: string
  backupData?: BackupData
  conflicts?: ConflictInfo[]
  totalSongs?: number
  totalTags?: number
}

/** 백업 가져오기 결과 */
export interface BackupImportSongResult {
  success: boolean
  newCode?: string
  newOrder?: number
}

// ===== 폼 관련 타입 =====

/** 찬양 등록/수정 폼 데이터 */
export interface SongFormData {
  title: string
  code: string
  order: number
  slides: string[]
  tagIds: number[]
}

// ===== 유틸리티 타입 =====

/** 로딩 상태 */
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

/** 비동기 데이터 상태 */
export interface AsyncState<T> extends LoadingState {
  data: T | null
}
