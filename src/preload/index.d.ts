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

// API Interfaces
export interface SongApi {
  create: (title: string, code: string, order: number) => Promise<Song>
  getByCodeOrder: (code: string, order: number) => Promise<Song | null>
  getById: (id: number) => Promise<Song | null>
  getAll: () => Promise<Song[]>
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
  open: () => Promise<void>
  close: () => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    songApi: SongApi
    slideApi: SlideApi
    presentationApi: PresentationApi
  }
}
