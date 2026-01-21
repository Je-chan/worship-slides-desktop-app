import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Song API
const songApi = {
  create: (title: string, code: string, order: number) =>
    ipcRenderer.invoke('song:create', title, code, order),

  getByCodeOrder: (code: string, order: number) =>
    ipcRenderer.invoke('song:getByCodeOrder', code, order),

  getById: (id: number) => ipcRenderer.invoke('song:getById', id),

  getAll: () => ipcRenderer.invoke('song:getAll'),

  getMaxOrderByCode: (code: string) => ipcRenderer.invoke('song:getMaxOrderByCode', code),

  update: (id: number, title: string, code: string, order: number) =>
    ipcRenderer.invoke('song:update', id, title, code, order),

  delete: (id: number) => ipcRenderer.invoke('song:delete', id)
}

// Slide API
const slideApi = {
  create: (songId: number, slideNumber: number, content: string) =>
    ipcRenderer.invoke('slide:create', songId, slideNumber, content),

  getBySongId: (songId: number) => ipcRenderer.invoke('slide:getBySongId', songId),

  update: (id: number, content: string) => ipcRenderer.invoke('slide:update', id, content),

  delete: (id: number) => ipcRenderer.invoke('slide:delete', id),

  deleteBySongId: (songId: number) => ipcRenderer.invoke('slide:deleteBySongId', songId)
}

// Tag API
const tagApi = {
  create: (name: string) => ipcRenderer.invoke('tag:create', name),

  getAll: () => ipcRenderer.invoke('tag:getAll'),

  getById: (id: number) => ipcRenderer.invoke('tag:getById', id),

  update: (id: number, name: string) => ipcRenderer.invoke('tag:update', id, name),

  delete: (id: number) => ipcRenderer.invoke('tag:delete', id)
}

// Song-Tag API
const songTagApi = {
  add: (songId: number, tagId: number) => ipcRenderer.invoke('songTag:add', songId, tagId),

  remove: (songId: number, tagId: number) => ipcRenderer.invoke('songTag:remove', songId, tagId),

  getBySongId: (songId: number) => ipcRenderer.invoke('songTag:getBySongId', songId),

  getSongsByTagId: (tagId: number) => ipcRenderer.invoke('songTag:getSongsByTagId', tagId),

  setTagsForSong: (songId: number, tagIds: number[]) =>
    ipcRenderer.invoke('songTag:setTagsForSong', songId, tagIds)
}

// Presentation API
const presentationApi = {
  getSlides: (songCodes: string[]) => ipcRenderer.invoke('presentation:getSlides', songCodes),

  open: () => ipcRenderer.invoke('presentation:open'),

  close: () => ipcRenderer.invoke('presentation:close')
}

// Expose APIs to renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('songApi', songApi)
    contextBridge.exposeInMainWorld('slideApi', slideApi)
    contextBridge.exposeInMainWorld('tagApi', tagApi)
    contextBridge.exposeInMainWorld('songTagApi', songTagApi)
    contextBridge.exposeInMainWorld('presentationApi', presentationApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.songApi = songApi
  // @ts-ignore
  window.slideApi = slideApi
  // @ts-ignore
  window.tagApi = tagApi
  // @ts-ignore
  window.songTagApi = songTagApi
  // @ts-ignore
  window.presentationApi = presentationApi
}
