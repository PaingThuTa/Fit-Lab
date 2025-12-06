import Card from '../../components/Card'
import Button from '../../components/Button'
import { trainerApplicants } from '../../data/mockData'

const TrainerApproval = () => {
  return (
    <Card title="Trainer approvals" description="Review pending submissions">
      <div className="space-y-4">
        {trainerApplicants.map((applicant) => (
          <div key={applicant.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{applicant.name}</p>
                <p className="text-sm text-slate-500">Submitted {applicant.submitted}</p>
                <p className="mt-2 text-xs uppercase text-slate-400">Specialties</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{applicant.specialties.join(', ')}</p>
                <p className="mt-2 text-xs uppercase text-slate-400">Certifications</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{applicant.certifications.join(', ')}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost">Decline</Button>
                <Button>Approve</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default TrainerApproval
