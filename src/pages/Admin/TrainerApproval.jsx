import { useCallback, useEffect, useState } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { getTrainerProposals, reviewTrainerProposal } from '../../services/adminService'

const TrainerApproval = () => {
  const [trainerApplications, setTrainerApplications] = useState([])
  const [error, setError] = useState('')

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
    try {
      await reviewTrainerProposal({ proposalId, action })
      await loadProposals()
    } catch (reviewError) {
      setError(reviewError.message || 'Unable to review proposal')
    }
  }

  return (
    <Card title="Trainer approvals" description="Review pending submissions">
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      <div className="space-y-4">
        {trainerApplications.map((applicant) => (
          <div key={applicant.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
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
                <Button
                  variant="ghost"
                  onClick={() => handleReview(applicant.id, 'reject')}
                  disabled={applicant.status === 'rejected'}
                >
                  Decline
                </Button>
                <Button
                  onClick={() => handleReview(applicant.id, 'approve')}
                  disabled={applicant.status === 'approved'}
                >
                  Approve
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default TrainerApproval
