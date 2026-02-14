import { useState } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { useAuthStore } from '../../store/useAuthStore'
import { getMyProposal, upsertMyProposal } from '../../services/proposalService'

const parseCommaValues = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const Proposal = () => {
  const user = useAuthStore((state) => state.user)
  const [existingApplication, setExistingApplication] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    const loadProposal = async () => {
      setError('')
      try {
        const proposal = await getMyProposal({ currentUser: user })
        if (mounted) {
          setExistingApplication(proposal)
          setForm({
            message: proposal?.message || '',
            specialties: proposal?.specialties?.join(', ') || '',
            certifications: proposal?.certifications?.join(', ') || '',
            experienceYears: String(proposal?.experienceYears || ''),
            sampleCourse: proposal?.sampleCourse || '',
            bio: proposal?.bio || '',
          })
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'Unable to load proposal')
        }
      }
    }

    loadProposal()
    return () => {
      mounted = false
    }
  }, [user])

  const [form, setForm] = useState({
    message: '',
    specialties: '',
    certifications: '',
    experienceYears: '',
    sampleCourse: '',
    bio: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    try {
      const proposal = await upsertMyProposal(
        {
          message: form.message.trim(),
          specialties: parseCommaValues(form.specialties),
          certifications: parseCommaValues(form.certifications),
          experienceYears: Number(form.experienceYears) || 0,
          sampleCourse: form.sampleCourse.trim(),
          bio: form.bio.trim(),
        },
        { currentUser: user }
      )
      setExistingApplication(proposal)
      setNotice('Proposal submitted for admin review.')
    } catch (submitError) {
      setError(submitError.message || 'Unable to submit proposal')
    } finally {
      setSaving(false)
    }
  }

  const status = existingApplication?.status || 'not-submitted'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card title="Trainer proposal" description="Apply to coach members on the Fit-Lab platform">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60">
          <p className="font-medium text-slate-900 dark:text-white">Current status: {status}</p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            Trainer applications are reviewed by admins before trainer tools are unlocked.
          </p>
        </div>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="md:col-span-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Proposal message</span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              className="mt-2 min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Share what you want to coach and why you are a good fit."
            />
          </label>
          <Input
            label="Specialties"
            name="specialties"
            value={form.specialties}
            onChange={handleChange}
            placeholder="Strength, HIIT, Mobility"
            className="md:col-span-2"
          />
          <Input
            label="Certifications"
            name="certifications"
            value={form.certifications}
            onChange={handleChange}
            placeholder="NASM CPT, RYT 200"
            className="md:col-span-2"
          />
          <Input
            label="Years coaching"
            type="number"
            min="0"
            name="experienceYears"
            value={form.experienceYears}
            onChange={handleChange}
            placeholder="3"
          />
          <Input
            label="Sample course title"
            name="sampleCourse"
            value={form.sampleCourse}
            onChange={handleChange}
            placeholder="Foundations of Strength"
          />
          <label className="md:col-span-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Coaching bio</span>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="mt-2 min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Describe your coaching approach, audience, and safety standards."
            />
          </label>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <Button type="submit">{saving ? 'Submitting...' : 'Submit proposal'}</Button>
            <Button as={Link} to="/member" variant="outline">
              Back to member home
            </Button>
          </div>
          {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
          {notice ? <p className="md:col-span-2 text-sm text-emerald-600">{notice}</p> : null}
        </form>
      </Card>
    </div>
  )
}

export default Proposal
