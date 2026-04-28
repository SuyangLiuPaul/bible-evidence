import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, Loader2, BookOpen, ExternalLink } from 'lucide-react'
import { evidences, type Evidence } from '../data/evidences'

// SECURITY NOTE — 2026-04-28
// This component used to embed Gemini API keys directly in the JS
// bundle. Even with a build-time env var the keys still shipped to
// every visitor's browser, where anyone with devtools could extract
// them. Round 53 moved the Gemini call server-side: the client posts
// to `/api/aiSearch` (a Netlify Function — see
// `netlify/functions/aiSearch.mjs`) which holds the key in Netlify
// env vars and proxies the call to Google.
//
// No keys live in this file or the bundle anymore. The 5 historically
// hardcoded keys (visible in git history before commit 9e188f8) MUST
// still be REVOKED in Google AI Studio:
//   https://aistudio.google.com/app/apikey
//
// API contract for /api/aiSearch:
//   POST  body  = { contents, systemInstruction, generationConfig }
//   200   body  = full Gemini response (same shape the client used to
//                 receive when calling Gemini directly)
//   non-200     = { error: { message, status? } }
const AISEARCH_ENDPOINT = '/api/aiSearch'

interface Message {
  role: 'user' | 'assistant'
  content: string
  relatedEvidence?: string[]
}

function localSearch(question: string): Evidence[] {
  const q = question.toLowerCase()
  const keywords = q.split(/\s+/).filter(w => w.length > 2)
  const scored = evidences.map(e => {
    const fields = [e.id, e.category, ...e.bibleBooks, e.scriptureReference, e.timeline, e.location].join(' ').toLowerCase()
    let score = 0
    for (const kw of keywords) {
      if (fields.includes(kw)) score++
    }
    return { e, score }
  }).filter(s => s.score > 0).sort((a, b) => b.score - a.score)
  return scored.slice(0, 8).map(s => s.e)
}

async function askGemini(question: string, isEn: boolean): Promise<{ answer: string; relatedIds: string[] }> {
  const lang = isEn ? 'English' : 'Chinese'
  const matches = localSearch(question)
  const hasMatches = matches.length > 0

  const matchedEntries = matches.map(e => `${e.id}[${e.category}/${e.confidenceLevel}]`).join(',')

  const systemText = hasMatches
    ? `You are the search assistant for a Biblical Evidence Archive. Respond ONLY in ${lang}. Be brief (1-2 sentences).

The user's question matches these archive entries:
${matchedEntries}

Say a brief 1-sentence summary confirming what's in the archive, then end with: [RELATED: id1, id2, id3] using exact IDs above.`
    : `You are the search assistant for a Biblical Evidence Archive. Respond ONLY in ${lang}. Be brief (1 sentence).

The user's question does NOT match any archive entries. Say so briefly. End with: [RELATED: none]`

  const body = {
    contents: [
      { role: 'user', parts: [{ text: question }] },
    ],
    systemInstruction: {
      parts: [{ text: systemText }]
    },
    generationConfig: {
      maxOutputTokens: 512,
      temperature: 0.2,
    },
  }

  // Server-side proxy. The function rotates through keys in
  // GEMINI_API_KEYS env var, retries on 429/403, and returns the
  // raw Gemini response so the parsing below stays the same.
  const res = await fetch(AISEARCH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let msg = `AI search service error (${res.status})`
    try {
      const j = await res.json()
      msg = j?.error?.message || msg
    } catch (_) { /* ignore parse errors */ }
    throw new Error(msg)
  }
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.'

  // Extract related IDs
  const relatedMatch = text.match(/\[RELATED:\s*(.*?)\]/)
  const relatedIds = relatedMatch
    ? relatedMatch[1].split(',').map((s: string) => s.trim()).filter((s: string) => s && s !== 'none')
    : []

  // Remove the [RELATED: ...] tag from display text
  const answer = text.replace(/\[RELATED:\s*.*?\]/, '').trim()

  return { answer, relatedIds }
}

export default function AISearch() {
  const { t, i18n } = useTranslation()
  const isEn = i18n.language === 'en'
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    const q = query.trim()
    if (!q || loading) return

    setMessages(prev => [...prev, { role: 'user', content: q }])
    setQuery('')
    setLoading(true)
    setError('')

    try {
      const { answer, relatedIds } = await askGemini(q, isEn)
      setMessages(prev => [...prev, { role: 'assistant', content: answer, relatedEvidence: relatedIds }])
    } catch (err: any) {
      setError(err.message || 'Failed to get response')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const findEvidence = (id: string): Evidence | undefined =>
    evidences.find(e => e.id === id)

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-40 h-12 px-5 rounded-2xl glass flex items-center gap-2 hover:bg-white/70 transition-all shadow-glass"
            aria-label={isEn ? 'AI Search' : 'AI 搜索'}
          >
            <Sparkles className="w-5 h-5 text-sapphire" />
            <span className="text-parchment text-sm font-semibold hidden sm:inline">
              {isEn ? 'Ask AI' : 'AI 问答'}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 bottom-4 top-[15vh] md:inset-x-auto md:right-6 md:top-auto md:bottom-6 md:w-[420px] md:h-[520px] z-[55] flex flex-col rounded-3xl glass-heavy overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/20 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sapphire" />
                <span className="text-parchment font-semibold text-sm">
                  {isEn ? 'Evidence AI' : '实证 AI'}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/30 backdrop-blur-md flex items-center justify-center hover:bg-white/50 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-parchment-muted" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl glass-subtle flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-7 h-7 text-sapphire/50" />
                  </div>
                  <p className="text-parchment-muted text-sm mb-3">
                    {isEn ? 'Ask about any biblical evidence' : '询问任何圣经证据'}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      isEn ? 'Is the Dead Sea Scrolls in the archive?' : '死海古卷在档案中吗？',
                      isEn ? 'What evidence exists for King David?' : '大卫王有什么证据？',
                      isEn ? 'Tell me about Noah\'s Ark evidence' : '诺亚方舟的证据',
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => { setQuery(suggestion); inputRef.current?.focus() }}
                        className="px-3 py-1.5 rounded-xl bg-white/25 backdrop-blur-md border border-white/30 text-parchment-muted text-xs hover:bg-white/40 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-sapphire/90 text-white rounded-br-md'
                      : 'bg-white/40 backdrop-blur-md border border-white/30 text-parchment-dim rounded-bl-md'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Related evidence links */}
                    {msg.relatedEvidence && msg.relatedEvidence.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-white/20 space-y-1.5">
                        <p className="text-[11px] font-semibold text-parchment-muted uppercase tracking-wider">
                          {isEn ? 'In this archive:' : '本档案中：'}
                        </p>
                        {msg.relatedEvidence.map(id => {
                          const ev = findEvidence(id)
                          if (!ev) return null
                          return (
                            <a
                              key={id}
                              href="#evidence"
                              onClick={() => {
                                // Dispatch custom event to trigger evidence selection
                                window.dispatchEvent(new CustomEvent('select-evidence', { detail: id }))
                                setIsOpen(false)
                              }}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-sapphire/10 hover:bg-sapphire/20 transition-colors group"
                            >
                              <BookOpen className="w-3 h-3 text-sapphire flex-shrink-0" />
                              <span className="text-xs text-sapphire font-medium truncate group-hover:underline">
                                {t(ev.titleKey)}
                              </span>
                              <ExternalLink className="w-3 h-3 text-sapphire/50 ml-auto flex-shrink-0" />
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/40 backdrop-blur-md border border-white/30 px-4 py-3 rounded-2xl rounded-bl-md">
                    <Loader2 className="w-4 h-4 text-sapphire animate-spin" />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center py-2">
                  <p className="text-red-500/80 text-xs">{error}</p>
                  <button onClick={handleSend} className="text-sapphire text-xs underline mt-1">
                    {isEn ? 'Retry' : '重试'}
                  </button>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/20 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isEn ? 'Ask about biblical evidence...' : '询问圣经证据...'}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/40 backdrop-blur-xl border border-white/40 text-parchment text-sm placeholder:text-parchment-muted/50 focus:outline-none focus:ring-2 focus:ring-sapphire/20 focus:border-sapphire/30"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !query.trim()}
                  className="w-10 h-10 rounded-xl bg-sapphire text-white flex items-center justify-center hover:bg-sapphire-light disabled:opacity-40 transition-colors flex-shrink-0"
                  aria-label={isEn ? 'Send' : '发送'}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
