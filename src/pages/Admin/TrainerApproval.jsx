import Card from '../../components/Card'
import Button from '../../components/Button'
import { useAuthStore } from '../../store/useAuthStore'

const TrainerApproval = () => {
  const trainerApplications = useAuthStore((state) => state.trainerApplications)
  const approveTrainerApplication = useAuthStore((state) => state.approveTrainerApplication)
  const declineTrainerApplication = useAuthStore((state) => state.declineTrainerApplication)

  return (
    <Card title="Trainer approvals" description="Review pending submissions">
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
                  onClick={() => declineTrainerApplication(applicant.id)}
                  disabled={applicant.status === 'declined'}
                >
                  Decline
                </Button>
                <Button
                  onClick={() => approveTrainerApplication(applicant.id)}
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
