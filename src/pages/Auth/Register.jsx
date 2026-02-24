import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { useAuthStore } from '../../store/useAuthStore'

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', interest: 'training' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)
  const authLoading = useAuthStore((state) => state.authLoading)
  const authReady = useAuthStore((state) => state.authReady)
  const role = useAuthStore((state) => state.role)

  if (authReady && role) return <Navigate to={`/${role}`} replace />

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await register({
        fullName: form.name || 'Fit-Lab User',
        email: form.email,
        password: form.password || 'Member123!',
      })
    } catch (submitError) {
      setError(submitError.message || 'Unable to register')
      return
    }

    const isCoachingInterest = form.interest === 'coaching'
    navigate(isCoachingInterest ? '/trainer/proposal' : '/member')
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-8 py-6 lg:grid-cols-2">
      <Card title="Create an account" description="Just a few details to personalize your view">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Full name" name="name" placeholder="Avery Cole" value={form.name} onChange={handleChange} />
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="you@Fit-Lab.app"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
          />
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            Primary interest
            <select
              name="interest"
              value={form.interest}
              onChange={handleChange}
              className="field-control"
            >
              <option value="training">Finding training programs</option>
              <option value="coaching">Coaching other members</option>
            </select>
          </label>
          {error ? <p className="status-error">{error}</p> : null}
          <Button type="submit" className="w-full">
            {authLoading ? 'Creating account...' : 'Continue'}
          </Button>
        </form>
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          Already onboard?{' '}
          <Link to="/login" className="font-semibold text-primary-600">
            Log in
          </Link>
        </p>
      </Card>
      <div className="hidden flex-col justify-center rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary-700 p-8 text-white shadow-xl shadow-slate-900/30 lg:flex">
        <h3 className="text-2xl font-semibold">Why Fit-Lab?</h3>
        <ul className="mt-6 space-y-4 text-sm text-white/80">
          <li>• Access curated workouts from verified trainers.</li>
          <li>• Apply as a trainer with a proposal reviewed by admins.</li>
          <li>• Manage courses, rosters, and enrollments in one place once approved.</li>
          <li>• Admin dashboards reveal adoption and proposal approvals at a glance.</li>
        </ul>
      </div>
    </div>
  )
}

export default Register
