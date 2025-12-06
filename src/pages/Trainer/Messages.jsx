import { useEffect, useMemo, useState } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { messageThreads } from '../../data/mockData'
import { useAuthStore } from '../../store/useAuthStore'

const TrainerMessages = () => {
  const user = useAuthStore((state) => state.user)
  const currentName = user?.name ?? 'Avery Cole'
  const threads = useMemo(() => {
    const ownThreads = messageThreads.filter((thread) => thread.trainerName === currentName)
    return ownThreads.length ? ownThreads : messageThreads
  }, [currentName])
  const [selectedId, setSelectedId] = useState(threads[0]?.id ?? null)
  const selectedThread = threads.find((thread) => thread.id === selectedId)

  useEffect(() => {
    if (threads.length === 0) {
      setSelectedId(null)
      return
    }
    const exists = threads.some((thread) => thread.id === selectedId)
    if (!exists) {
      setSelectedId(threads[0].id)
    }
  }, [threads, selectedId])

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <Card title="Member messages" description="Sample conversations are preloaded so you can preview the flow">
        <div className="space-y-2">
          {threads.length === 0 && <p className="text-sm text-slate-500">No conversations yet.</p>}
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setSelectedId(thread.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-slate-800 ${
                selectedId === thread.id
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
      >
        {selectedThread ? (
          <div className="flex h-full flex-col gap-4">
            <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
              {selectedThread.messages.map((message, index) => (
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
              <Input label="Write a message" placeholder="Share feedback or resources" />
              <div className="flex gap-3">
                <Button size="sm">Send</Button>
                <Button variant="outline" size="sm">Attach</Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Pick a member conversation to start messaging.</p>
        )}
      </Card>
    </div>
  )
}

export default TrainerMessages
