import { useCallback, useEffect, useState } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { getTrainerProposals, reviewTrainerProposal } from '../../services/adminService'

const TrainerApproval = () => {
  const [trainerApplications, setTrainerApplications] = useState([])
  const [error, setError] = useState('')
  const pendingApplications = trainerApplications.filter((applicant) => applicant.status === 'pending')

  const loadProposals = useCallback(async () => {
    setError('')
    try {
      const proposals = await getTrainerProposals()
      setTrainerApplications(proposals)
    } catch (loadError) {
      setError(loadError.message || 'Unable to load trainer proposals')
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProposals()
  }, [loadProposals])

  const handleReview = async (proposalId, action) => {
    const confirmationMessage =
      action === 'approve'
        ? 'Approve this trainer proposal? This will grant trainer access.'
        : 'Decline this trainer proposal? This action will mark the proposal as rejected.'
    const confirmed = window.confirm(confirmationMessage)
    if (!confirmed) return

    let rejectionReason
    if (action === 'reject') {
      const reason = window.prompt('Enter a rejection reason for the applicant (required):')
      if (reason === null) return
      if (!reason.trim()) {
        setError('Rejection reason is required.')
        return
      }
      rejectionReason = reason.trim()
    }

    try {
      setError('')
      await reviewTrainerProposal({ proposalId, action, rejectionReason })
      setTrainerApplications((current) => current.filter((item) => item.id !== proposalId))
    } catch (reviewError) {
      setError(reviewError.message || 'Unable to review proposal')
    }
  }

  return (
    <Card title="Trainer approvals" description="Review pending submissions">
      {error ? <p className="mb-3 status-error">{error}</p> : null}
      <div className="space-y-4">
        {pendingApplications.length === 0 ? (
          <p className="status-muted">No pending trainer proposals.</p>
        ) : (
          pendingApplications.map((applicant) => (
            <div key={applicant.id} className="surface-soft">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{applicant.name}</p>
                  <p className="text-sm text-slate-500">Submitted {applicant.submitted}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Status: {applicant.status}</p>
                  <p className="mt-2 text-xs uppercase text-slate-400">Specialties</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {applicant.specialties?.join(', ') || 'Not provided'}
                  </p>
                  <p className="mt-2 text-xs uppercase text-slate-400">Certifications</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {applicant.certifications?.join(', ') || 'Not provided'}
                  </p>
                  {applicant.bio ? <p className="mt-2 text-sm text-slate-500">{applicant.bio}</p> : null}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => handleReview(applicant.id, 'reject')}>
                    Decline
                  </Button>
                  <Button onClick={() => handleReview(applicant.id, 'approve')}>Approve</Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

export default TrainerApproval
