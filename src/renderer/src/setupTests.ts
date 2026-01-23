import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock window.songApi
export const mockSongApi = {
  create: vi.fn(),
  getByCodeOrder: vi.fn(),
  getById: vi.fn(),
  getAll: vi.fn(),
  getMaxOrderByCode: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
}

// Mock window.slideApi
export const mockSlideApi = {
  create: vi.fn(),
  getBySongId: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  deleteBySongId: vi.fn()
}

// Mock window.tagApi
export const mockTagApi = {
  create: vi.fn(),
  getAll: vi.fn(),
  getById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
}

// Mock window.songTagApi
export const mockSongTagApi = {
  add: vi.fn(),
  remove: vi.fn(),
  getBySongId: vi.fn(),
  getSongsByTagId: vi.fn(),
  setTagsForSong: vi.fn()
}

// Mock window.presentationApi
export const mockPresentationApi = {
  getSlides: vi.fn(),
  open: vi.fn(),
  close: vi.fn(),
  setFullscreen: vi.fn(),
  isFullscreen: vi.fn(),
  onUpdateSlides: vi.fn()
}

// Mock window.imageApi
export const mockImageApi = {
  select: vi.fn(),
  delete: vi.fn()
}

// Mock window.backupApi
export const mockBackupApi = {
  export: vi.fn(),
  read: vi.fn(),
  importSong: vi.fn(),
  importTags: vi.fn()
}

// Assign to window
Object.defineProperty(window, 'songApi', { value: mockSongApi, writable: true })
Object.defineProperty(window, 'slideApi', { value: mockSlideApi, writable: true })
Object.defineProperty(window, 'tagApi', { value: mockTagApi, writable: true })
Object.defineProperty(window, 'songTagApi', { value: mockSongTagApi, writable: true })
Object.defineProperty(window, 'presentationApi', { value: mockPresentationApi, writable: true })
Object.defineProperty(window, 'imageApi', { value: mockImageApi, writable: true })
Object.defineProperty(window, 'backupApi', { value: mockBackupApi, writable: true })

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
