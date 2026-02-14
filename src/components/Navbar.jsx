import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from './Button'
import { useAuthStore } from '../store/useAuthStore'

const Navbar = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)
  const logout = useAuthStore((state) => state.logout)
  const updateUserName = useAuthStore((state) => state.updateUserName)
  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState(user?.name || '')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSaveName = () => {
    const trimmed = draftName.trim()
    if (trimmed.length === 0) return
    updateUserName(trimmed)
    setEditingName(false)
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-semibold text-slate-900 dark:text-white">
          Fit-Lab
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3 md:gap-4">
          {user ? (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-700">
              <div className="text-right">
                <p className="text-xs text-slate-500">{role?.toUpperCase()}</p>
                {editingName ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      className="w-40 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="Enter your name"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveName}>
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingName(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setDraftName(user.name)
                        setEditingName(true)
                      }}
                      className="text-xs font-medium text-primary-600 underline-offset-2 hover:underline dark:text-primary-300"
                    >
                      Edit name
                    </button>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Join
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
