import {
  createSong,
  createSlide,
  getAllSongs,
  deleteSlidesBySongId,
  deleteSong,
  createTag,
  getAllTags,
  getTagByName,
  addTagToSong,
  deleteTag
} from './database'

interface SeedSong {
  title: string
  code: string
  order: number
  lyrics: string[] // 각 항목이 하나의 슬라이드
  tags: string[] // 태그 이름들
}

// 시드 태그 목록
const seedTags = ['경배', '찬양', '감사', '은혜', '사랑', '십자가', '부활', '평화', '소망']

const seedData: SeedSong[] = [
  {
    title: '주님의 사랑',
    code: 'C',
    order: 1,
    lyrics: [
      '주님의 사랑 나를 감싸네\n그 품 안에서 평안을 찾네',
      '세상 그 무엇과 비교할 수 없는\n영원한 사랑 주님의 사랑',
      '나의 삶 속에 함께 하시며\n나의 길 위에 빛이 되시네'
    ],
    tags: ['사랑', '평화']
  },
  {
    title: '은혜 아니면',
    code: 'C',
    order: 2,
    lyrics: [
      '은혜 아니면 나 설 곳 없네\n주님의 은혜 날 세우시네',
      '연약한 나를 붙드시는 손\n그 사랑으로 나 살아가네',
      '주님만이 나의 소망\n주님만이 나의 생명'
    ],
    tags: ['은혜', '소망']
  },
  {
    title: '내 주를 가까이',
    code: 'C',
    order: 3,
    lyrics: [
      '내 주를 가까이 하게 함은\n십자가 짐같은 고생이나',
      '내 일생 소원은 늘 찬송하면서\n주를 더 가까이 하는 것'
    ],
    tags: ['십자가', '경배']
  },
  {
    title: '예수 사랑하심은',
    code: 'C',
    order: 4,
    lyrics: [
      '예수 사랑하심은\n거룩하신 말일세',
      '우리들은 약하나\n예수 권세 많도다',
      '날 사랑하심 날 사랑하심\n날 사랑하심 성경에 쓰였네'
    ],
    tags: ['사랑', '찬양']
  },
  {
    title: '주 하나님 지으신 모든 세계',
    code: 'C',
    order: 5,
    lyrics: [
      '주 하나님 지으신 모든 세계\n내 마음 속에 그리어 볼 때',
      '하늘의 별 울려 퍼지는 뇌성\n주님의 권능 우주에 찼네',
      '내 영혼아 그 주님을 찬양해\n그 권능 크심 높이 찬양해',
      '내 영혼아 그 주님을 찬양해\n찬양해 찬양해 내 구주'
    ],
    tags: ['찬양', '경배']
  },
  {
    title: '십자가 그 사랑',
    code: 'A',
    order: 1,
    lyrics: [
      '십자가 그 사랑 내게 전해지네\n나를 위해 피 흘리신 그 사랑',
      '내 모든 죄 씻기시려\n채찍에 맞으신 주님',
      '그 사랑 앞에 나 무릎 꿇네\n감사와 찬양 드리네'
    ],
    tags: ['십자가', '사랑', '감사']
  },
  {
    title: '나 같은 죄인 살리신',
    code: 'A',
    order: 2,
    lyrics: [
      '나 같은 죄인 살리신\n주 은혜 놀라워',
      '잃었던 생명 찾았고\n광명을 얻었네',
      '큰 죄악에서 건지신\n주 은혜 고마워'
    ],
    tags: ['은혜', '감사']
  },
  {
    title: '목마른 사슴',
    code: 'A',
    order: 3,
    lyrics: [
      '목마른 사슴이 시냇물을 찾아\n헤매이듯 내 영혼이 주님을 찾나이다',
      '주 만이 내 삶의 유일한 원천\n내 마음이 주님만을 찾고 있네',
      '내 영혼이 목마르니 주를 찾나이다\n주 만이 나의 산 수요 영원하리'
    ],
    tags: ['경배', '소망']
  },
  {
    title: '여호와는 나의 목자시니',
    code: 'B',
    order: 1,
    lyrics: [
      '여호와는 나의 목자시니\n내게 부족함이 없으리로다',
      '그가 나를 푸른 풀밭에 누이시며\n쉴만한 물가로 인도하시는도다',
      '내 영혼을 소생시키시고\n자기 이름을 위하여\n의의 길로 인도하시는도다'
    ],
    tags: ['평화', '은혜']
  },
  {
    title: '감사해',
    code: 'B',
    order: 2,
    lyrics: [
      '감사해 감사해\n주님의 은혜에 감사해',
      '나를 향한 주님의 사랑\n날마다 감사해',
      '아침마다 새로운 은혜\n저녁마다 함께 하시네',
      '주님의 사랑 끝이 없어\n영원토록 감사해'
    ],
    tags: ['감사', '사랑', '은혜']
  },
  {
    title: '주 안에 있는 나에게',
    code: 'B',
    order: 3,
    lyrics: [
      '주 안에 있는 나에게\n참 평화 주시네',
      '세상이 주지 못하는\n그 평화 내게 주셨네',
      '주 안에서 누리는\n그 기쁨 영원하리'
    ],
    tags: ['평화', '찬양']
  },
  {
    title: '살아계신 주',
    code: 'D',
    order: 1,
    lyrics: [
      '살아계신 주 살아계신 주\n무덤에서 부활하신 주',
      '살아계신 주 살아계신 주\n나와 함께 계시는 주',
      '그 이름은 예수 그 이름은 예수\n온 세상의 구원자'
    ],
    tags: ['부활', '찬양']
  },
  {
    title: '나의 영혼이',
    code: 'D',
    order: 2,
    lyrics: [
      '나의 영혼이 주님을 찬양해\n나의 모든 것 주께 드려요',
      '날 사랑하신 그 은혜 감사해\n영원토록 찬양합니다',
      '할렐루야 할렐루야\n나의 주 나의 하나님'
    ],
    tags: ['찬양', '감사', '경배']
  },
  {
    title: '이 땅에 오신 주',
    code: 'D',
    order: 3,
    lyrics: [
      '이 땅에 오신 주 우릴 위해 오셨네\n낮고 천한 말구유에 오셨네',
      '우릴 구원하시려 십자가 지셨네\n삼일 만에 부활하신 주님',
      '그 사랑 영원하리 찬양합니다'
    ],
    tags: ['십자가', '부활', '사랑']
  },
  {
    title: '주님께 영광',
    code: 'D',
    order: 4,
    lyrics: [
      '주님께 영광 주님께 영광\n높은 하늘 위에 계신 주님께',
      '온 땅위의 모든 것이\n주님을 찬양하네',
      '영광 영광 할렐루야\n영원히 찬양하리'
    ],
    tags: ['경배', '찬양']
  }
]

export function seedDatabase(): void {
  console.log('[Seed] 데이터베이스 시드 시작...')

  // 1. 태그 먼저 생성 (항상 실행)
  const tagMap: Record<string, number> = {}
  for (const tagName of seedTags) {
    try {
      const existingTag = getTagByName(tagName)
      if (existingTag) {
        tagMap[tagName] = existingTag.id
      } else {
        const tag = createTag(tagName)
        tagMap[tagName] = tag.id
        console.log(`[Seed] 태그 생성: ${tagName}`)
      }
    } catch (error) {
      console.error(`[Seed] 태그 생성 에러: ${tagName}`, error)
    }
  }

  // 2. 기존 찬양 확인
  const existingSongs = getAllSongs()

  if (existingSongs.length > 0) {
    // 기존 찬양이 있으면 태그만 연결
    console.log(`[Seed] 기존 ${existingSongs.length}개의 찬양에 태그 연결 중...`)

    for (const songData of seedData) {
      // 기존 찬양 찾기
      const existingSong = existingSongs.find(
        (s) => s.code === songData.code.toUpperCase() && s.order === songData.order
      )

      if (existingSong) {
        // 태그 연결
        for (const tagName of songData.tags) {
          const tagId = tagMap[tagName]
          if (tagId) {
            addTagToSong(existingSong.id, tagId)
          }
        }
      }
    }

    console.log(`[Seed] 완료! 기존 찬양에 태그가 연결되었습니다.`)
    return
  }

  // 3. 찬양이 없으면 새로 생성
  console.log('[Seed] 테스트 찬양 데이터 삽입 시작...')

  for (const songData of seedData) {
    try {
      // 찬양 생성
      const song = createSong(songData.title, songData.code, songData.order)
      console.log(`[Seed] 찬양 생성: ${songData.code}${songData.order} - ${songData.title}`)

      // 슬라이드 1: 제목
      createSlide(song.id, 1, songData.title)

      // 슬라이드 2~: 가사
      songData.lyrics.forEach((lyric, index) => {
        createSlide(song.id, index + 2, lyric)
      })

      // 태그 연결
      for (const tagName of songData.tags) {
        const tagId = tagMap[tagName]
        if (tagId) {
          addTagToSong(song.id, tagId)
        }
      }
    } catch (error) {
      console.error(`[Seed] 에러: ${songData.title}`, error)
    }
  }

  console.log(`[Seed] 완료! ${seedData.length}개의 찬양과 ${seedTags.length}개의 태그가 추가되었습니다.`)
}

export function clearDatabase(): void {
  const songs = getAllSongs()
  for (const song of songs) {
    deleteSlidesBySongId(song.id)
    deleteSong(song.id)
  }
  console.log('[Seed] 모든 데이터가 삭제되었습니다.')
}
