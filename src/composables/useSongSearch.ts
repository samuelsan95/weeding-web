import { ref, watch, type Ref } from 'vue'

export interface Track {
  id: string
  name: string
  artist: string
  album: string
  artwork: string
  previewUrl: string | null
  durationMs: number
}

interface ITunesTrack {
  trackId: number
  trackName: string
  artistName: string
  collectionName: string | null
  artworkUrl100: string
  previewUrl: string | null
  trackTimeMillis: number | null
}

interface ITunesResponse {
  resultCount: number
  results: ITunesTrack[]
}

function mapTrack(t: ITunesTrack): Track | null {
  if (!t.previewUrl || !t.trackName || !t.artistName) return null
  return {
    id: String(t.trackId),
    name: t.trackName,
    artist: t.artistName,
    album: t.collectionName ?? '',
    artwork: t.artworkUrl100.replace('100x100bb', '300x300bb'),
    previewUrl: t.previewUrl,
    durationMs: t.trackTimeMillis ?? 0
  }
}

function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export { formatDuration }

export function useSongSearch(
  query: Ref<string>,
  options: { debounceMs?: number; minLength?: number } = {}
) {
  const { debounceMs = 300, minLength = 3 } = options
  const results = ref<Track[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let abortController: AbortController | null = null
  let lastRequestedQuery = ''

  function clear() {
    results.value = []
    error.value = null
    isLoading.value = false
  }

  async function runSearch(q: string) {
    if (abortController) abortController.abort()
    const trimmed = q.trim()
    if (trimmed.length < minLength) {
      clear()
      return
    }
    lastRequestedQuery = trimmed
    isLoading.value = true
    error.value = null
    abortController = new AbortController()
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&entity=song&limit=8&media=music`
      const res = await fetch(url, { signal: abortController.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: ITunesResponse = await res.json()
      if (lastRequestedQuery !== trimmed) return
      results.value = data.results.map(mapTrack).filter((t): t is Track => t !== null)
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return
      if (lastRequestedQuery !== trimmed) return
      error.value = 'No se pudo buscar. Inténtalo de nuevo.'
      results.value = []
    } finally {
      if (lastRequestedQuery === trimmed) isLoading.value = false
    }
  }

  watch(query, (next) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    const trimmed = next.trim()
    if (trimmed.length < minLength) {
      clear()
      return
    }
    debounceTimer = setTimeout(() => runSearch(trimmed), debounceMs)
  })

  return { results, isLoading, error, runSearch, clear, minLength }
}
