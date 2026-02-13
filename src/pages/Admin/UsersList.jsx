import { useEffect, useState } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
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
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-400">
          <tr>
            <th className="py-3">Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Trainer application</th>
            <th className="text-right">Actions</th>
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
              <td className="text-right">
                <Button size="sm" variant="outline">
                  Manage
                </Button>
              </td>
            </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}

export default UsersList
