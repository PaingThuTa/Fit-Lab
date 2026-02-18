import Card from '../../components/Card'
import Button from '../../components/Button'
import { useAuthStore } from '../../store/useAuthStore'

const Profile = () => {
  const user = useAuthStore((state) => state.user)
  const profile = user ?? { name: 'Jordan Wells', role: 'member', city: 'Austin, TX' }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,2fr]">
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-xl font-semibold text-primary-700">
            {profile.name
              .split(' ')
              .map((word) => word[0])
              .join('')}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{profile.name}</h2>
            <p className="text-sm text-slate-500 capitalize">{profile.role}</p>
          </div>
        </div>
        <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>Location: {profile.city ?? 'Remote'}</p>
          <p>Joined: Feb 2022</p>
          <p>Preferred focus: Strength</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button size="sm">Edit profile</Button>
          <Button variant="outline" size="sm">
            Manage notifications
          </Button>
        </div>
      </Card>
      <Card title="Achievements" description="Visualize your commitment streaks">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { label: 'Weekly streak', value: '5 weeks' },
            { label: 'Total workouts', value: '124' },
            { label: 'Courses finished', value: '6' },
            { label: 'Coach chats', value: '18' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-slate-50 p-4 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default Profile
