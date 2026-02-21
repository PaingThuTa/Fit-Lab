import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/useAuthStore'
import { getThreadMessages, getThreads, sendMessage } from '../../services/messageService'
import { useApiMode } from '../../lib/dataMode'
import { queryKeys } from '../../lib/queryKeys'
import { createAppSocket } from '../../lib/socketClient'

/* ── tiny icons ── */
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
    <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.11 28.11 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.11 28.11 0 0 0 3.105 2.288Z" />
  </svg>
)
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
    <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
  </svg>
)
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
    <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
  </svg>
)

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?'

const TrainerMessages = () => {
  const user = useAuthStore((state) => state.user)
  const currentName = user?.name ?? 'Avery Cole'
  const [selectedId, setSelectedId] = useState(null)
  const [showThreadList, setShowThreadList] = useState(true)
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const threadsQuery = useQuery({
    queryKey: queryKeys.messageThreads('trainer'),
    queryFn: ({ signal }) => getThreads({ role: 'trainer', currentName, signal }),
  })
  const threads = useMemo(() => threadsQuery.data || [], [threadsQuery.data])

  const filteredThreads = useMemo(() => {
    if (!search.trim()) return threads
    const q = search.toLowerCase()
    return threads.filter(
      (t) =>
        (t.memberName || '').toLowerCase().includes(q) ||
        (t.courseTitle || '').toLowerCase().includes(q)
    )
  }, [threads, search])

  const selectedThread = useMemo(() => {
    if (threads.length === 0) return null
    return threads.find((thread) => thread.id === selectedId) ?? threads[0]
  }, [threads, selectedId])

  useEffect(() => {
    if (threads.length > 0) {
      setSelectedId((prev) => prev || threads[0].id)
    }
  }, [threads])

  const threadMessagesQuery = useQuery({
    queryKey: queryKeys.threadMessages({
      otherUserId: selectedThread?.otherUserId,
      courseId: selectedThread?.courseId,
    }),
    queryFn: ({ signal }) =>
      getThreadMessages({
        otherUserId: selectedThread?.otherUserId,
        courseId: selectedThread?.courseId,
        signal,
      }),
    enabled: Boolean(selectedThread) && useApiMode,
  })

  const sendMessageMutation = useMutation({
    mutationFn: ({ receiverId, courseId, content }) => sendMessage({ receiverId, courseId, content }),
    onSuccess: async () => {
      await Promise.all([threadsQuery.refetch(), threadMessagesQuery.refetch()])
      setDraft('')
    },
  })

  const threadMessages = useMemo(() => {
    if (!selectedThread) return []
    if (!useApiMode) return selectedThread.messages || []
    const messages = threadMessagesQuery.data || []
    return messages.map((message) => ({
      sender: message.senderId === user?.userId ? 'trainer' : 'member',
      text: message.content,
      time: new Date(message.sentAt).toLocaleString(),
    }))
  }, [selectedThread, threadMessagesQuery.data, user?.userId])

  const error = threadsQuery.error?.message || threadMessagesQuery.error?.message || ''

  /* auto-scroll to bottom on new messages */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [threadMessages])

  /* focus input when thread selected */
  useEffect(() => {
    if (selectedThread && !showThreadList) {
      inputRef.current?.focus()
    }
  }, [selectedThread, showThreadList])

  const handleSelectThread = (threadId) => {
    setSelectedId(threadId)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setShowThreadList(false)
    }
  }

  const handleSend = () => {
    if (!selectedThread || !draft.trim()) return
    sendMessageMutation.mutate({
      receiverId: selectedThread.otherUserId,
      courseId: selectedThread.courseId,
      content: draft.trim(),
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  /* ── socket real-time ── */
  useEffect(() => {
    if (!useApiMode || !user?.userId) return undefined

    const socket = createAppSocket()
    if (!socket) return undefined

    const handleIncomingMessage = (payload) => {
      threadsQuery.refetch()
      if (!selectedThread) return
      const sameParticipants =
        (payload.senderId === selectedThread.otherUserId && payload.receiverId === user.userId) ||
        (payload.receiverId === selectedThread.otherUserId && payload.senderId === user.userId)
      const sameCourse = String(payload.courseId || '') === String(selectedThread.courseId || '')
      if (sameParticipants && sameCourse) threadMessagesQuery.refetch()
    }

    const handleConnectError = () => threadsQuery.refetch()

    socket.on('message:new', handleIncomingMessage)
    socket.on('connect_error', handleConnectError)

    return () => {
      socket.off('message:new', handleIncomingMessage)
      socket.off('connect_error', handleConnectError)
      socket.disconnect()
    }
  }, [selectedThread, threadMessagesQuery, threadsQuery, user?.userId])

  return (
    <div className="chat-shell">
      {error && <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 status-error text-xs px-4 py-1.5 shadow-lg rounded-lg">{error}</div>}

      {/* ── thread list panel ── */}
      <div className={`chat-threads ${showThreadList ? 'flex' : 'hidden lg:flex'}`}>
        {/* search bar */}
        <div className="p-3 border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-lg border-0 bg-slate-100 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:bg-slate-800/80 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
            />
          </div>
        </div>

        {/* thread items */}
        <div className="flex-1 overflow-y-auto">
          {threadsQuery.isPending && (
            <div className="flex items-center gap-2 px-4 py-6 text-sm text-slate-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary-500" />
              Loading...
            </div>
          )}
          {!threadsQuery.isPending && filteredThreads.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-slate-400">
              {search ? 'No matching conversations' : 'No conversations yet'}
            </p>
          )}
          {filteredThreads.map((thread) => {
            const isActive = selectedThread?.id === thread.id
            return (
              <button
                key={thread.id}
                onClick={() => handleSelectThread(thread.id)}
                className={`chat-thread-item ${isActive ? 'chat-thread-active' : ''}`}
              >
                <div className="chat-avatar chat-avatar-sm">
                  {getInitials(thread.memberName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-white">
                      {thread.memberName}
                    </p>
                    <span className="shrink-0 text-[10px] text-slate-400">{thread.lastTimestamp}</span>
                  </div>
                  <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">{thread.courseTitle}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{thread.lastMessage}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── chat area ── */}
      <div className={`chat-main ${showThreadList ? 'hidden lg:flex' : 'flex'}`}>
        {selectedThread ? (
          <>
            {/* chat header */}
            <div className="chat-header">
              <button
                type="button"
                onClick={() => setShowThreadList(true)}
                className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
              >
                <BackIcon />
              </button>
              <div className="chat-avatar chat-avatar-sm">
                {getInitials(selectedThread.memberName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {selectedThread.memberName}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{selectedThread.courseTitle}</p>
              </div>
            </div>

            {/* messages */}
            <div className="chat-messages">
              {threadMessagesQuery.isPending && (
                <div className="flex justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-primary-500" />
                </div>
              )}
              {threadMessages.length === 0 && !threadMessagesQuery.isPending && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="chat-avatar mb-3" style={{ width: 48, height: 48, fontSize: 16 }}>
                    {getInitials(selectedThread.memberName)}
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Start a conversation with {selectedThread.memberName}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Send a message about {selectedThread.courseTitle}
                  </p>
                </div>
              )}
              {threadMessages.map((message, index) => {
                const isOwn = message.sender === 'trainer'
                const showAvatar =
                  index === 0 || threadMessages[index - 1]?.sender !== message.sender
                return (
                  <div
                    key={index}
                    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${showAvatar ? 'mt-3' : 'mt-0.5'}`}
                  >
                    {/* avatar spacer */}
                    <div className="w-7 shrink-0">
                      {showAvatar && !isOwn && (
                        <div className="chat-avatar" style={{ width: 28, height: 28, fontSize: 10 }}>
                          {getInitials(selectedThread.memberName)}
                        </div>
                      )}
                    </div>
                    <div className={`flex max-w-[75%] flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`chat-bubble ${
                          isOwn
                            ? 'chat-bubble-own'
                            : 'chat-bubble-other'
                        }`}
                      >
                        {message.text}
                      </div>
                      {showAvatar && (
                        <span className="mt-0.5 px-1 text-[10px] text-slate-400">{message.time}</span>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* composer */}
            <div className="chat-composer">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  className="chat-input"
                />
                <button
                  type="button"
                  disabled={!draft.trim() || sendMessageMutation.isPending}
                  onClick={handleSend}
                  className="chat-send-btn"
                >
                  {sendMessageMutation.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <SendIcon />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-slate-400">
                <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Select a conversation</p>
            <p className="text-xs text-slate-400">Choose a thread from the left to start chatting</p>
            <button
              type="button"
              onClick={() => setShowThreadList(true)}
              className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 lg:hidden"
            >
              View conversations
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrainerMessages
