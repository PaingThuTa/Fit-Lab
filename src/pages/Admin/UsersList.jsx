import { useEffect, useState } from 'react'
import Card from '../../components/Card'
import { getAdminUsers } from '../../services/adminService'

const UsersList = () => {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const loadUsers = async () => {
      setError('')
      try {
        const payload = await getAdminUsers()
        if (mounted) {
          setUsers(payload)
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'Unable to load users')
        }
      }
    }

    loadUsers()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <Card title="Users" description="Members, trainers, and trainer applicant statuses">
      {error ? <p className="mb-3 status-error">{error}</p> : null}
      <div className="space-y-3 md:hidden">
        {users.map((user) => (
          <div key={user.userId || user.email || user.fullName} className="mobile-list-row">
            <p className="font-semibold text-slate-900 dark:text-white">{user.fullName}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-2 py-1 capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {user.role}
              </span>
              <span className="rounded-full bg-primary-50 px-2 py-1 capitalize text-primary-700 dark:bg-primary-700/20 dark:text-primary-200">
                {user.trainerApplicationStatus || 'none'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <table className="hidden w-full text-left text-sm md:table">
        <thead className="text-xs uppercase text-slate-400">
          <tr>
            <th className="py-3">Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Trainer application</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((user) => {
            return (
              <tr key={user.userId || user.email || user.fullName} className="text-slate-600 dark:text-slate-300">
                <td className="py-3 font-medium text-slate-900 dark:text-white">{user.fullName}</td>
                <td>{user.email}</td>
                <td className="capitalize">{user.role}</td>
                <td className="capitalize">{user.trainerApplicationStatus || 'none'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {users.length === 0 ? <p className="mt-3 status-muted">No users available.</p> : null}
    </Card>
  )
}

export default UsersList
