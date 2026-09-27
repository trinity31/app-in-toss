export function createTarotLibrary({ baseUrl, accountHeaders, fetcher = fetch }) {
  async function request(path) {
    if (!baseUrl) throw new Error('타로 보관함 연결 설정을 확인해 주세요.')
    const headers = await accountHeaders()
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 30000)
    try {
      const response = await fetcher(`${baseUrl.replace(/\/$/, '')}/tarot/sessions/history${path}`, {
        headers: { ...headers, 'X-Tarot-Deck': 'tarot78-v1' }, signal: controller.signal,
      })
      if (!response.ok) throw new Error('저장된 타로 풀이를 불러오지 못했어요. 다시 시도해 주세요.')
      return await response.json()
    } finally { clearTimeout(timer) }
  }
  return {
    async list(offset = 0) {
      const data = await request(`?offset=${offset}`)
      if (!Array.isArray(data.items) || typeof data.has_more !== 'boolean') throw new Error('타로 목록을 확인하지 못했어요.')
      return data
    },
    async detail(id) {
      const data = await request(`/${encodeURIComponent(id)}`)
      if (data.id !== id || !data.reading || !Array.isArray(data.cards)) throw new Error('타로 풀이를 확인하지 못했어요.')
      return data
    },
  }
}
