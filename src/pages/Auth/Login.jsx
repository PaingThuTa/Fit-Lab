import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { useAuthStore } from '../../store/useAuthStore'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'member' })
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    login({ name: form.name || 'Fit-Lab Member', role: form.role, email: form.email })
    navigate(`/${form.role}`)
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-8 py-10 lg:grid-cols-2">
      <div className="hidden flex-col justify-center rounded-3xl bg-gradient-to-br from-primary-600 to-secondary p-8 text-white lg:flex">
        <p className="text-sm uppercase tracking-[0.3em] text-white/80">Welcome back</p>
        <h2 className="mt-4 text-3xl font-semibold">Train smarter with Fit-Lab</h2>
        <p className="mt-3 text-white/80">
          Preview your dashboard instantly by choosing a role below. This login experience is only a front-end
          prototype for now.
        </p>
      </div>
      <Card title="Login" description="Choose a role to explore the experience">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Name" name="name" placeholder="Jordan Wells" value={form.name} onChange={handleChange} />
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
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            Role
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="member">Member</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <Button type="submit" className="w-full">
            Continue as {form.role}
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
