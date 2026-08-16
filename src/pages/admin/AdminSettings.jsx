import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Settings } from 'lucide-react'
import Loading from '../../components/ui/Loading'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { useApi } from '../../hooks/useApi'
import { getSettings, updateSettings } from '../../api/settings'

const inputClass =
  'min-h-11 w-full rounded-xl border-0 bg-sand-100 px-4 text-sm text-moss-900 ring-1 ring-sand-200 placeholder:text-moss-800/40 focus:outline-none focus:ring-2 focus:ring-moss-500'

const sections = [
  {
    title: 'Resort',
    description: 'The identity shown across the public site.',
    keys: ['resort_name', 'resort_tagline', 'resort_description'],
  },
  {
    title: 'Contact details',
    description: 'How guests reach you.',
    keys: ['address', 'maps_url', 'phone', 'phone_secondary', 'email', 'email_press'],
  },
  {
    title: 'Hours & booking',
    description: 'Times, currency and check-in rules.',
    keys: ['reception_hours', 'concierge_hours', 'currency', 'check_in_time', 'check_out_time'],
  },
  {
    title: 'Booking.com',
    description: 'Direct booking link shown on the public site.',
    keys: ['booking_url'],
  },
  {
    title: 'Social media',
    description: 'Links used in the site footer and contact section.',
    keys: ['social_facebook', 'social_tiktok', 'social_instagram'],
  },
]

export default function AdminSettings() {
  const { data: seed, loading, error, refetch } = useApi(getSettings)
  const [values, setValues] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (seed && Array.isArray(seed)) {
      setValues((prev) => {
        const next = { ...prev }
        seed.forEach((row) => {
          next[row.setting_key] = row.setting_value
        })
        return next
      })
    }
  }, [seed])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateSettings(
        Object.entries(values).map(([key, value]) => ({ key, value: String(value ?? '') })),
      )
      const next = {}
      updated.forEach((row) => {
        next[row.setting_key] = row.setting_value
      })
      setValues(next)
      toast.success('Settings saved')
    } catch (err) {
      toast.error(err.message || 'Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading && !seed) {
    return (
      <div className="space-y-5">
        <h2 className="font-display text-2xl font-bold text-moss-900">Settings</h2>
        <Loading />
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-moss-900">Settings</h2>
        <p className="mt-1 text-sm text-moss-800/70">
          Resort details, contact information and booking rules.
        </p>
      </div>

      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {sections.map((section) => (
        <section
          key={section.title}
          className="rounded-2xl bg-sand-50 p-5 ring-1 ring-sand-200 sm:p-6"
        >
          <h3 className="font-display text-base font-semibold text-moss-900">{section.title}</h3>
          <p className="mt-0.5 text-sm text-moss-800/60">{section.description}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {section.keys.map((key) => (
              <div key={key}>
                <label
                  htmlFor={`setting-${key}`}
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-moss-800/60"
                >
                  {key.replaceAll('_', ' ')}
                </label>
                {key === 'resort_description' ? (
                  <textarea
                    id={`setting-${key}`}
                    rows={3}
                    value={values[key] ?? ''}
                    onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                    className={inputClass}
                  />
                ) : (
                  <input
                    id={`setting-${key}`}
                    type="text"
                    value={values[key] ?? ''}
                    onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-moss-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-moss-700 disabled:opacity-60"
        >
          <Settings size={16} /> {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </form>
  )
}
