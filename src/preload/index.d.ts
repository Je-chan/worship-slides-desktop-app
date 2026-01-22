import { ElectronAPI } from '@electron-toolkit/preload'

// Types
export interface Song {
  id: number
  title: string
  code: string
  order: number
}

export interface Slide {
  id: number
  song_id: number
  slide_number: number
  content: string
}

export interface PresentationSlide {
  songId: number
  songTitle: string
  songCode: string
  songOrder: number
  slideNumber: number
  content: string
}

export interface Tag {
  id: number
  name: string
}

// API Interfaces
export interface SongApi {
  create: (title: string, code: string, order: number) => Promise<Song>
  getByCodeOrder: (code: string, order: number) => Promise<Song | null>
  getById: (id: number) => Promise<Song | null>
  getAll: () => Promise<Song[]>
  getMaxOrderByCode: (code: string) => Promise<number>
  update: (id: number, title: string, code: string, order: number) => Promise<boolean>
  delete: (id: number) => Promise<boolean>
}

export interface SlideApi {
  create: (songId: number, slideNumber: number, content: string) => Promise<Slide>
  getBySongId: (songId: number) => Promise<Slide[]>
  update: (id: number, content: string) => Promise<boolean>
  delete: (id: number) => Promise<boolean>
  deleteBySongId: (songId: number) => Promise<boolean>
}

export interface PresentationApi {
  getSlides: (songCodes: string[]) => Promise<PresentationSlide[]>
  open: (slides: PresentationSlide[]) => Promise<void>
  close: () => Promise<void>
  setFullscreen: (fullscreen: boolean) => Promise<void>
  isFullscreen: () => Promise<boolean>
  onUpdateSlides: (callback: (slides: PresentationSlide[]) => void) => () => void
}

export interface TagApi {
  create: (name: string) => Promise<Tag>
  getAll: () => Promise<Tag[]>
  getById: (id: number) => Promise<Tag | null>
  update: (id: number, name: string) => Promise<boolean>
  delete: (id: number) => Promise<boolean>
}

export interface SongTagApi {
  add: (songId: number, tagId: number) => Promise<boolean>
  remove: (songId: number, tagId: number) => Promise<boolean>
  getBySongId: (songId: number) => Promise<Tag[]>
  getSongsByTagId: (tagId: number) => Promise<Song[]>
  setTagsForSong: (songId: number, tagIds: number[]) => Promise<void>
}

export interface ImageApi {
  select: () => Promise<string | null>
  delete: (imagePath: string) => Promise<boolean>
}

// Backup Types
export interface BackupSongData {
  title: string
  code: string
  order: number
  slides: Array<{ slideNumber: number; content: string }>
  tags: string[]
}

export interface BackupData {
  version: number
  exportedAt: string
  songs: BackupSongData[]
  tags: string[]
}

export interface ConflictInfo {
  type: 'song' | 'tag'
  backupItem: BackupSongData | string
  existingItem: Song | Tag | null
  code?: string
  order?: number
}

export interface BackupExportResult {
  success: boolean
  canceled?: boolean
  filePath?: string
  error?: string
}

export interface BackupReadResult {
  success: boolean
  canceled?: boolean
  error?: string
  backupData?: BackupData
  conflicts?: ConflictInfo[]
  totalSongs?: number
  totalTags?: number
}

export interface BackupImportSongResult {
  success: boolean
  newCode?: string
  newOrder?: number
}

export interface BackupApi {
  export: () => Promise<BackupExportResult>
  read: () => Promise<BackupReadResult>
  importSong: (
    songData: BackupSongData,
    strategy: 'skip' | 'overwrite' | 'newCode'
  ) => Promise<BackupImportSongResult>
  importTags: (tagNames: string[]) => Promise<{ success: boolean }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    songApi: SongApi
    slideApi: SlideApi
    presentationApi: PresentationApi
    tagApi: TagApi
    songTagApi: SongTagApi
    imageApi: ImageApi
    backupApi: BackupApi
  }
}
