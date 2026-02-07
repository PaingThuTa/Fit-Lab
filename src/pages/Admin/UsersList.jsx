import Card from '../../components/Card'
import Button from '../../components/Button'
import { users } from '../../data/mockData'
import { useAuthStore } from '../../store/useAuthStore'

const UsersList = () => {
  const currentUser = useAuthStore((state) => state.user)
  const applications = useAuthStore((state) => state.trainerApplications)
  const allUsers = currentUser && !users.some((user) => user.email === currentUser.email) ? [currentUser, ...users] : users

  return (
    <Card title="Users" description="Members, trainers, and trainer applicant statuses">
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
          {allUsers.map((user) => {
            const application = applications.find((applicant) => {
              if (user.email?.trim()) {
                return applicant.email?.toLowerCase() === user.email.toLowerCase()
              }
              return applicant.name.toLowerCase() === user.name.toLowerCase()
            })

            return (
              <tr key={user.id || user.email || user.name} className="text-slate-600 dark:text-slate-300">
              <td className="py-3 font-medium text-slate-900 dark:text-white">{user.name}</td>
              <td>{user.email}</td>
              <td className="capitalize">{user.role}</td>
              <td className="capitalize">{application?.status || 'none'}</td>
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
