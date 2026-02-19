import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { useAuthStore } from '../../store/useAuthStore'
import { useApiMode } from '../../lib/dataMode'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'member' })
  const [error, setError] = useState('')
  const login = useAuthStore((state) => state.login)
  const authLoading = useAuthStore((state) => state.authLoading)
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const user = await login(
        useApiMode
          ? {
              email: form.email,
              password: form.password,
            }
          : {
              name: form.name || 'Fit-Lab Member',
              role: form.role,
              email: form.email,
              password: form.password,
            }
      )
      navigate(`/${user.role}`)
    } catch (submitError) {
      setError(submitError.message || 'Unable to login')
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-8 py-6 lg:grid-cols-2">
      <div className="hidden flex-col justify-center rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-secondary p-8 text-white shadow-xl shadow-primary-900/20 lg:flex">
        <p className="text-sm uppercase tracking-[0.3em] text-white/80">Welcome back</p>
        <h2 className="mt-4 text-3xl font-semibold">Train smarter with Fit-Lab</h2>
        <p className="mt-3 text-white/80">
          {useApiMode
            ? 'Sign in with your account to access your personalized dashboard.'
            : 'Preview your dashboard instantly by choosing a role below. This login experience is only a front-end prototype for now.'}
        </p>
      </div>
      <Card
        title="Login"
        description={
          useApiMode
            ? 'Use your email and password to continue.'
            : 'Choose a role to explore the experience.'
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!useApiMode && (
            <Input label="Name" name="name" placeholder="Jordan Wells" value={form.name} onChange={handleChange} />
          )}
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
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
          />
          {!useApiMode && (
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Role
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="field-control"
              >
                <option value="member">Member</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}
          {error ? <p className="status-error">{error}</p> : null}
          <Button type="submit" className="w-full">
            {authLoading ? 'Signing in...' : `Continue${useApiMode ? '' : ` as ${form.role}`}`}
          </Button>
        </form>
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          New here?{' '}
          <Link to="/register" className="font-medium text-primary-600">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default Login
