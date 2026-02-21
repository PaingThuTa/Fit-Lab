import { useState } from 'react'
import Button from './Button'

// Mock form — format-only checks, no real card validation needed

function formatCardNumber(raw) {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function PaymentForm({ courseTitle, coursePrice, onSuccess, onCancel }) {
  const [name, setName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [loading, setLoading] = useState(false)

  const digits = cardNumber.replace(/\s/g, '')
  const cardValid = digits.length >= 13
  const expiryValid = /^\d{2}\/\d{2}$/.test(expiry)
  const cvcValid = /^\d{3,4}$/.test(cvc)
  const canSubmit = name.trim() && cardValid && expiryValid && cvcValid

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldError('')
    setLoading(true)
    try {
      await onSuccess({ cardLastFour: digits.slice(-4) })
    } catch (err) {
      setFieldError(err.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Payment details</p>
        {courseTitle !== undefined && (
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Enrolling in{' '}
            <span className="font-medium text-slate-700 dark:text-slate-200">{courseTitle}</span>
            {coursePrice !== undefined && (
              <> &mdash; <span className="font-semibold text-primary-600">{coursePrice}</span></>
            )}
          </p>
        )}
      </div>

      {/* Cardholder name */}
      <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
        <span className="font-medium text-slate-700 dark:text-slate-200">Cardholder name</span>
        <input
          type="text"
          className="field-control"
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="cc-name"
          required
        />
      </label>

      {/* Card number */}
      <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
        <span className="font-medium text-slate-700 dark:text-slate-200">Card number</span>
        <input
          type="tel"
          inputMode="numeric"
          className="field-control"
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          autoComplete="cc-number"
          required
        />
      </label>

      {/* Expiry + CVC — plain inputs, no Stripe key required */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-200">Expiry</span>
          <input
            type="tel"
            inputMode="numeric"
            className="field-control"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            autoComplete="cc-exp"
            maxLength={5}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-200">CVC</span>
          <input
            type="tel"
            inputMode="numeric"
            className="field-control"
            placeholder="123"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
            autoComplete="cc-csc"
            maxLength={4}
            required
          />
        </label>
      </div>

      {fieldError && <p className="status-error text-sm">{fieldError}</p>}

      <div className="flex flex-wrap gap-3 pt-1">
        <Button type="submit" disabled={loading || !canSubmit}>
          {loading ? 'Processing...' : 'Pay & Enroll'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
