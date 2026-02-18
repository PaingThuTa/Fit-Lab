import { useMemo, useState } from 'react'
import { useEffect } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { useAuthStore } from '../../store/useAuthStore'
import { getThreadMessages, getThreads, sendMessage } from '../../services/messageService'
import { useApiMode } from '../../lib/dataMode'

const MemberMessages = () => {
  const user = useAuthStore((state) => state.user)
  const currentName = user?.name ?? 'Jordan Wells'
  const [threads, setThreads] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [threadMessages, setThreadMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const loadThreads = async () => {
      setError('')
      try {
        const nextThreads = await getThreads({ role: 'member', currentName })
        if (mounted) {
          setThreads(nextThreads)
          setSelectedId((prev) => prev || nextThreads[0]?.id || null)
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'Unable to load messages')
        }
      }
    }

    loadThreads()
    return () => {
      mounted = false
    }
  }, [currentName])

  const selectedThread = useMemo(() => {
    if (threads.length === 0) return null
    return threads.find((thread) => thread.id === selectedId) ?? threads[0]
  }, [threads, selectedId])

  useEffect(() => {
    let mounted = true
    const loadThreadMessages = async () => {
      if (!selectedThread) {
        setThreadMessages([])
        return
      }

      if (!useApiMode) {
        setThreadMessages(selectedThread.messages || [])
        return
      }

      try {
        const messages = await getThreadMessages({
          otherUserId: selectedThread.otherUserId,
          courseId: selectedThread.courseId,
        })
        if (mounted) {
          setThreadMessages(
            messages.map((message) => ({
              sender: message.senderId === user?.userId ? 'member' : 'trainer',
              text: message.content,
              time: new Date(message.sentAt).toLocaleString(),
            }))
          )
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'Unable to load thread')
        }
      }
    }

    loadThreadMessages()
    return () => {
      mounted = false
    }
  }, [selectedThread, user])

  const handleSend = async () => {
    if (!selectedThread || !useApiMode || !draft.trim()) return

    try {
      await sendMessage({
        receiverId: selectedThread.otherUserId,
        courseId: selectedThread.courseId,
        content: draft.trim(),
      })

      const messages = await getThreadMessages({
        otherUserId: selectedThread.otherUserId,
        courseId: selectedThread.courseId,
      })

      setThreadMessages(
        messages.map((message) => ({
          sender: message.senderId === user?.userId ? 'member' : 'trainer',
          text: message.content,
          time: new Date(message.sentAt).toLocaleString(),
        }))
      )
      setDraft('')
    } catch (sendError) {
      setError(sendError.message || 'Unable to send message')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <Card title="Messages" description="Sample conversations are preloaded so you can preview the flow">
        {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
        <div className="space-y-2">
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
              <p className="text-sm font-semibold">{thread.trainerName}</p>
              <p className="text-xs text-slate-500">{thread.courseTitle}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{thread.lastMessage}</p>
              <p className="text-xs text-slate-400">{thread.lastTimestamp}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card
        title={selectedThread ? `Chat with ${selectedThread.trainerName}` : 'Select a conversation'}
        description={selectedThread ? selectedThread.courseTitle : 'Choose a thread to view messages'}
      >
        {selectedThread ? (
          <div className="flex h-full flex-col gap-4">
            <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
              {threadMessages.map((message, index) => (
                <div key={index} className="flex flex-col">
                  <span className="text-xs uppercase text-slate-400">{message.sender}</span>
                  <span className="rounded-xl bg-white px-3 py-2 text-sm text-slate-800 shadow-sm dark:bg-slate-800 dark:text-slate-100">
                    {message.text}
                  </span>
                  <span className="text-[11px] text-slate-400">{message.time}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <Input
                label="Write a message"
                placeholder="Type your update"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <div className="flex gap-3">
                <Button size="sm" disabled={!useApiMode || !draft.trim()} onClick={handleSend}>Send</Button>
              </div>
              {useApiMode ? <p className="text-xs text-slate-400">Send is enabled in API mode.</p> : null}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Pick a trainer conversation to start messaging.</p>
        )}
      </Card>
    </div>
  )
}

export default MemberMessages
