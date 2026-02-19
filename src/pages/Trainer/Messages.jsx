import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { useAuthStore } from '../../store/useAuthStore'
import { getThreadMessages, getThreads, sendMessage } from '../../services/messageService'
import { useApiMode } from '../../lib/dataMode'
import { queryKeys } from '../../lib/queryKeys'

const TrainerMessages = () => {
  const user = useAuthStore((state) => state.user)
  const currentName = user?.name ?? 'Avery Cole'
  const [selectedId, setSelectedId] = useState(null)
  const [draft, setDraft] = useState('')
  const threadsQuery = useQuery({
    queryKey: queryKeys.messageThreads('trainer'),
    queryFn: ({ signal }) => getThreads({ role: 'trainer', currentName, signal }),
  })
  const threads = useMemo(() => threadsQuery.data || [], [threadsQuery.data])

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

  return (
    <div className="page-shell">
      <Button as={Link} to="/trainer" size="sm" variant="outline">
        Back to trainer dashboard
      </Button>

      <div className="grid gap-6 lg:grid-cols-[320px,minmax(0,1fr)]">
        <Card
          title="Member messages"
          description="Sample conversations are preloaded so you can preview the flow"
          className="min-h-[520px] lg:h-[70vh] lg:max-h-[760px]"
        >
          {error ? <p className="mb-3 status-error">{error}</p> : null}
          {threadsQuery.isPending ? <p className="mb-2 text-sm text-slate-500">Loading conversations...</p> : null}
          <div className="max-h-[58vh] space-y-2 overflow-y-auto pr-1 lg:max-h-[calc(70vh-9rem)]">
            {threads.length === 0 && <p className="text-sm text-slate-500">No conversations yet.</p>}
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedId(thread.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-slate-800 ${
                  selectedThread?.id === thread.id
                    ? 'border-primary-300 bg-primary-50 text-primary-900 dark:border-primary-400 dark:bg-slate-800'
                    : 'border-slate-100 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                }`}
              >
                <p className="text-sm font-semibold">{thread.memberName}</p>
                <p className="text-xs text-slate-500">{thread.courseTitle}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{thread.lastMessage}</p>
                <p className="text-xs text-slate-400">{thread.lastTimestamp}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card
          title={selectedThread ? `Chat with ${selectedThread.memberName}` : 'Select a conversation'}
          description={selectedThread ? selectedThread.courseTitle : 'Choose a thread to view messages'}
          className="min-h-[520px] lg:h-[70vh] lg:max-h-[760px]"
        >
          {selectedThread ? (
            <div className="flex h-full min-h-0 flex-col gap-4">
              <div className="flex-1 min-h-0 space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                {threadMessagesQuery.isPending ? (
                  <p className="text-sm text-slate-500">Loading thread...</p>
                ) : null}
                {threadMessages.map((message, index) => (
                  <div key={index} className={`flex flex-col ${message.sender === 'trainer' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[11px] uppercase text-slate-400">{message.sender}</span>
                    <span
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm shadow-sm ${
                        message.sender === 'trainer'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {message.text}
                    </span>
                    <span className="text-[11px] text-slate-400">{message.time}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-800">
                <label className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium text-slate-700 dark:text-slate-200">Write a message</span>
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Share feedback or resources"
                    className="field-control min-h-[96px] w-full p-3"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    size="sm"
                    disabled={!useApiMode || !draft.trim() || sendMessageMutation.isPending}
                    onClick={() =>
                      sendMessageMutation.mutate({
                        receiverId: selectedThread.otherUserId,
                        courseId: selectedThread.courseId,
                        content: draft.trim(),
                      })
                    }
                  >
                    {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
                  </Button>
                  {useApiMode ? <p className="text-xs text-slate-400">Send is enabled in API mode.</p> : null}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Pick a member conversation to start messaging.</p>
          )}
        </Card>
      </div>
    </div>
  )
}

export default TrainerMessages
