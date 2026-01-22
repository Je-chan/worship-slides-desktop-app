import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { copyFileSync, existsSync, mkdirSync, unlinkSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import {
  initDatabase,
  createSong,
  getSongByCodeOrder,
  getSongById,
  getAllSongs,
  getMaxOrderByCode,
  updateSong,
  deleteSong,
  createSlide,
  getSlidesBySongId,
  updateSlide,
  deleteSlide,
  deleteSlidesBySongId,
  getSlidesForPresentation,
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
  addTagToSong,
  removeTagFromSong,
  getTagsBySongId,
  getSongsByTagId,
  setTagsForSong
} from './database'
import { seedDatabase } from './seed'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer based on electron-vite cli
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Presentation 전용 창 (Kiosk 모드)
let presentationWindow: BrowserWindow | null = null
let presentationSlides: unknown[] = []

function createPresentationWindow(slides: unknown[]): void {
  // 슬라이드 데이터 저장
  presentationSlides = slides

  if (presentationWindow) {
    // 이미 창이 있으면 슬라이드만 업데이트하고 포커스
    presentationWindow.webContents.send('presentation:updateSlides', slides)
    presentationWindow.focus()
    return
  }

  presentationWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    autoHideMenuBar: true,
    fullscreen: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  presentationWindow.on('ready-to-show', () => {
    presentationWindow?.show()
    // 창이 준비되면 슬라이드 데이터 전송
    presentationWindow?.webContents.send('presentation:updateSlides', presentationSlides)
  })

  presentationWindow.on('closed', () => {
    presentationWindow = null
    presentationSlides = []
  })

  // Presentation 모드 URL/파일 로드
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    presentationWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/presentation`)
  } else {
    presentationWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: '/presentation'
    })
  }
}

function togglePresentationFullscreen(fullscreen: boolean): void {
  if (presentationWindow) {
    presentationWindow.setFullScreen(fullscreen)
  }
}

app.whenReady().then(() => {
  // DB 초기화
  initDatabase()

  // 개발 모드에서 테스트 데이터 시드
  if (is.dev) {
    seedDatabase()
  }

  electronApp.setAppUserModelId('com.worship-slides')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // ===== Song IPC Handlers =====
  ipcMain.handle('song:create', (_, title: string, code: string, order: number) => {
    return createSong(title, code, order)
  })

  ipcMain.handle('song:getByCodeOrder', (_, code: string, order: number) => {
    return getSongByCodeOrder(code, order)
  })

  ipcMain.handle('song:getById', (_, id: number) => {
    return getSongById(id)
  })

  ipcMain.handle('song:getAll', () => {
    return getAllSongs()
  })

  ipcMain.handle('song:getMaxOrderByCode', (_, code: string) => {
    return getMaxOrderByCode(code)
  })

  ipcMain.handle('song:update', (_, id: number, title: string, code: string, order: number) => {
    return updateSong(id, title, code, order)
  })

  ipcMain.handle('song:delete', (_, id: number) => {
    return deleteSong(id)
  })

  // ===== Slide IPC Handlers =====
  ipcMain.handle('slide:create', (_, songId: number, slideNumber: number, content: string) => {
    return createSlide(songId, slideNumber, content)
  })

  ipcMain.handle('slide:getBySongId', (_, songId: number) => {
    return getSlidesBySongId(songId)
  })

  ipcMain.handle('slide:update', (_, id: number, content: string) => {
    return updateSlide(id, content)
  })

  ipcMain.handle('slide:delete', (_, id: number) => {
    return deleteSlide(id)
  })

  ipcMain.handle('slide:deleteBySongId', (_, songId: number) => {
    return deleteSlidesBySongId(songId)
  })

  // ===== Tag IPC Handlers =====
  ipcMain.handle('tag:create', (_, name: string) => {
    return createTag(name)
  })

  ipcMain.handle('tag:getAll', () => {
    return getAllTags()
  })

  ipcMain.handle('tag:getById', (_, id: number) => {
    return getTagById(id)
  })

  ipcMain.handle('tag:update', (_, id: number, name: string) => {
    return updateTag(id, name)
  })

  ipcMain.handle('tag:delete', (_, id: number) => {
    return deleteTag(id)
  })

  // ===== Song-Tag IPC Handlers =====
  ipcMain.handle('songTag:add', (_, songId: number, tagId: number) => {
    return addTagToSong(songId, tagId)
  })

  ipcMain.handle('songTag:remove', (_, songId: number, tagId: number) => {
    return removeTagFromSong(songId, tagId)
  })

  ipcMain.handle('songTag:getBySongId', (_, songId: number) => {
    return getTagsBySongId(songId)
  })

  ipcMain.handle('songTag:getSongsByTagId', (_, tagId: number) => {
    return getSongsByTagId(tagId)
  })

  ipcMain.handle('songTag:setTagsForSong', (_, songId: number, tagIds: number[]) => {
    return setTagsForSong(songId, tagIds)
  })

  // ===== Presentation IPC Handlers =====
  ipcMain.handle('presentation:getSlides', (_, songCodes: string[]) => {
    return getSlidesForPresentation(songCodes)
  })

  ipcMain.handle('presentation:open', (_, slides: unknown[]) => {
    createPresentationWindow(slides)
  })

  ipcMain.handle('presentation:close', () => {
    if (presentationWindow) {
      presentationWindow.close()
      presentationWindow = null
    }
  })

  ipcMain.handle('presentation:setFullscreen', (_, fullscreen: boolean) => {
    togglePresentationFullscreen(fullscreen)
  })

  ipcMain.handle('presentation:isFullscreen', () => {
    return presentationWindow?.isFullScreen() ?? false
  })

  // ===== Image IPC Handlers =====
  const imagesDir = join(app.getPath('userData'), 'backgrounds')

  // 이미지 폴더 생성
  if (!existsSync(imagesDir)) {
    mkdirSync(imagesDir, { recursive: true })
  }

  ipcMain.handle('image:select', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }]
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const sourcePath = result.filePaths[0]
    const fileName = `bg_${Date.now()}_${sourcePath.split('/').pop()}`
    const destPath = join(imagesDir, fileName)

    try {
      copyFileSync(sourcePath, destPath)
      return `file://${destPath}`
    } catch (error) {
      console.error('이미지 복사 실패:', error)
      return null
    }
  })

  ipcMain.handle('image:delete', (_, imagePath: string) => {
    try {
      // file:// 프로토콜 제거
      const filePath = imagePath.replace('file://', '')
      if (existsSync(filePath) && filePath.startsWith(imagesDir)) {
        unlinkSync(filePath)
        return true
      }
    } catch (error) {
      console.error('이미지 삭제 실패:', error)
    }
    return false
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
