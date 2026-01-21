import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'

// DB 경로 설정
const getDbPath = (): string => {
  const isDev = !app.isPackaged
  if (isDev) {
    return path.join(__dirname, '../../worship.db')
  }
  return path.join(app.getPath('userData'), 'worship.db')
}

// DB 인스턴스
let db: Database.Database | null = null

// DB 초기화
export const initDatabase = (): void => {
  db = new Database(getDbPath())

  // 테이블 생성
  db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      code TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      UNIQUE(code, "order")
    );

    CREATE TABLE IF NOT EXISTS slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      song_id INTEGER NOT NULL,
      slide_number INTEGER NOT NULL,
      content TEXT NOT NULL,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
      UNIQUE(song_id, slide_number)
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS song_tags (
      song_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (song_id, tag_id),
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
  `)
}

// DB 인스턴스 가져오기
const getDb = (): Database.Database => {
  if (!db) {
    throw new Error('Database not initialized')
  }
  return db
}

// ===== Songs CRUD =====

export interface Song {
  id: number
  title: string
  code: string
  order: number
}

// 찬양 생성
export const createSong = (title: string, code: string, order: number): Song => {
  const db = getDb()
  const stmt = db.prepare('INSERT INTO songs (title, code, "order") VALUES (?, ?, ?)')
  const result = stmt.run(title, code.toUpperCase(), order)
  return {
    id: result.lastInsertRowid as number,
    title,
    code: code.toUpperCase(),
    order
  }
}

// 찬양 조회 (CODE + ORDER로)
export const getSongByCodeOrder = (code: string, order: number): Song | null => {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM songs WHERE code = ? AND "order" = ?')
  const row = stmt.get(code.toUpperCase(), order) as Song | undefined
  return row ?? null
}

// 찬양 조회 (ID로)
export const getSongById = (id: number): Song | null => {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM songs WHERE id = ?')
  const row = stmt.get(id) as Song | undefined
  return row ?? null
}

// 모든 찬양 조회
export const getAllSongs = (): Song[] => {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM songs ORDER BY code, "order"')
  return stmt.all() as Song[]
}

// 코드별 최대 순서 조회
export const getMaxOrderByCode = (code: string): number => {
  const db = getDb()
  const stmt = db.prepare('SELECT MAX("order") as maxOrder FROM songs WHERE code = ?')
  const result = stmt.get(code.toUpperCase()) as { maxOrder: number | null } | undefined
  return result?.maxOrder ?? 0
}

// 찬양 수정
export const updateSong = (id: number, title: string, code: string, order: number): boolean => {
  const db = getDb()
  const stmt = db.prepare('UPDATE songs SET title = ?, code = ?, "order" = ? WHERE id = ?')
  const result = stmt.run(title, code.toUpperCase(), order, id)
  return result.changes > 0
}

// 찬양 삭제
export const deleteSong = (id: number): boolean => {
  const db = getDb()
  const stmt = db.prepare('DELETE FROM songs WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

// ===== Slides CRUD =====

export interface Slide {
  id: number
  song_id: number
  slide_number: number
  content: string
}

// 슬라이드 생성
export const createSlide = (songId: number, slideNumber: number, content: string): Slide => {
  const db = getDb()
  const stmt = db.prepare('INSERT INTO slides (song_id, slide_number, content) VALUES (?, ?, ?)')
  const result = stmt.run(songId, slideNumber, content)
  return {
    id: result.lastInsertRowid as number,
    song_id: songId,
    slide_number: slideNumber,
    content
  }
}

// 찬양의 모든 슬라이드 조회
export const getSlidesBySongId = (songId: number): Slide[] => {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM slides WHERE song_id = ? ORDER BY slide_number')
  return stmt.all(songId) as Slide[]
}

// 슬라이드 수정
export const updateSlide = (id: number, content: string): boolean => {
  const db = getDb()
  const stmt = db.prepare('UPDATE slides SET content = ? WHERE id = ?')
  const result = stmt.run(content, id)
  return result.changes > 0
}

// 슬라이드 삭제
export const deleteSlide = (id: number): boolean => {
  const db = getDb()
  const stmt = db.prepare('DELETE FROM slides WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

// 찬양의 모든 슬라이드 삭제
export const deleteSlidesBySongId = (songId: number): boolean => {
  const db = getDb()
  const stmt = db.prepare('DELETE FROM slides WHERE song_id = ?')
  const result = stmt.run(songId)
  return result.changes > 0
}

// ===== Tags CRUD =====

export interface Tag {
  id: number
  name: string
}

// 태그 생성
export const createTag = (name: string): Tag => {
  const db = getDb()
  const stmt = db.prepare('INSERT INTO tags (name) VALUES (?)')
  const result = stmt.run(name.trim())
  return {
    id: result.lastInsertRowid as number,
    name: name.trim()
  }
}

// 모든 태그 조회
export const getAllTags = (): Tag[] => {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM tags ORDER BY name')
  return stmt.all() as Tag[]
}

// 태그 조회 (ID로)
export const getTagById = (id: number): Tag | null => {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM tags WHERE id = ?')
  const row = stmt.get(id) as Tag | undefined
  return row ?? null
}

// 태그 조회 (이름으로)
export const getTagByName = (name: string): Tag | null => {
  const db = getDb()
  const stmt = db.prepare('SELECT * FROM tags WHERE name = ?')
  const row = stmt.get(name.trim()) as Tag | undefined
  return row ?? null
}

// 태그 수정
export const updateTag = (id: number, name: string): boolean => {
  const db = getDb()
  const stmt = db.prepare('UPDATE tags SET name = ? WHERE id = ?')
  const result = stmt.run(name.trim(), id)
  return result.changes > 0
}

// 태그 삭제
export const deleteTag = (id: number): boolean => {
  const db = getDb()
  const stmt = db.prepare('DELETE FROM tags WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

// ===== Song-Tag 매핑 =====

// 찬양에 태그 추가
export const addTagToSong = (songId: number, tagId: number): boolean => {
  const db = getDb()
  try {
    const stmt = db.prepare('INSERT INTO song_tags (song_id, tag_id) VALUES (?, ?)')
    stmt.run(songId, tagId)
    return true
  } catch {
    return false // 이미 존재하는 경우
  }
}

// 찬양에서 태그 제거
export const removeTagFromSong = (songId: number, tagId: number): boolean => {
  const db = getDb()
  const stmt = db.prepare('DELETE FROM song_tags WHERE song_id = ? AND tag_id = ?')
  const result = stmt.run(songId, tagId)
  return result.changes > 0
}

// 찬양의 태그 목록 조회
export const getTagsBySongId = (songId: number): Tag[] => {
  const db = getDb()
  const stmt = db.prepare(`
    SELECT t.* FROM tags t
    INNER JOIN song_tags st ON t.id = st.tag_id
    WHERE st.song_id = ?
    ORDER BY t.name
  `)
  return stmt.all(songId) as Tag[]
}

// 태그로 찬양 검색
export const getSongsByTagId = (tagId: number): Song[] => {
  const db = getDb()
  const stmt = db.prepare(`
    SELECT s.* FROM songs s
    INNER JOIN song_tags st ON s.id = st.song_id
    WHERE st.tag_id = ?
    ORDER BY s.code, s."order"
  `)
  return stmt.all(tagId) as Song[]
}

// 찬양의 태그 일괄 설정 (기존 태그 제거 후 새로 추가)
export const setTagsForSong = (songId: number, tagIds: number[]): void => {
  const db = getDb()

  // 기존 태그 모두 제거
  db.prepare('DELETE FROM song_tags WHERE song_id = ?').run(songId)

  // 새 태그 추가
  const insertStmt = db.prepare('INSERT INTO song_tags (song_id, tag_id) VALUES (?, ?)')
  for (const tagId of tagIds) {
    insertStmt.run(songId, tagId)
  }
}

// ===== Presentation 관련 =====

export interface PresentationSlide {
  songId: number
  songTitle: string
  songCode: string
  songOrder: number
  slideNumber: number
  content: string
}

// 여러 찬양의 슬라이드를 합쳐서 가져오기 (예: ["c5", "c6", "a3"])
export const getSlidesForPresentation = (songCodes: string[]): PresentationSlide[] => {
  const db = getDb()
  const result: PresentationSlide[] = []

  for (const songCode of songCodes) {
    // 코드 파싱 (예: "c5" -> code: "C", order: 5)
    const match = songCode.match(/^([a-zA-Z]+)(\d+)$/)
    if (!match) continue

    const [, code, orderStr] = match
    const order = parseInt(orderStr, 10)

    const song = getSongByCodeOrder(code, order)
    if (!song) continue

    const slides = getSlidesBySongId(song.id)
    for (const slide of slides) {
      result.push({
        songId: song.id,
        songTitle: song.title,
        songCode: song.code,
        songOrder: song.order,
        slideNumber: slide.slide_number,
        content: slide.content
      })
    }
  }

  return result
}
