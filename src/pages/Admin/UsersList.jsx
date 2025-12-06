import Card from '../../components/Card'
import Button from '../../components/Button'
import { users } from '../../data/mockData'

const UsersList = () => {
  return (
    <Card title="Users" description="Members and trainers">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-400">
          <tr>
            <th className="py-3">Name</th>
            <th>Email</th>
            <th>Role</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((user) => (
            <tr key={user.id} className="text-slate-600 dark:text-slate-300">
              <td className="py-3 font-medium text-slate-900 dark:text-white">{user.name}</td>
              <td>{user.email}</td>
              <td className="capitalize">{user.role}</td>
              <td className="text-right">
                <Button size="sm" variant="outline">
                  Manage
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default UsersList
