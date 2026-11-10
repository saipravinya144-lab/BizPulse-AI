
import { useEffect, useState } from 'react'
import {
  UserRound,
  Building2,
  ShieldCheck,
  Mail,
  BriefcaseBusiness,
  FileText,
  LockKeyhole,
  Save,
  LoaderCircle,
} from 'lucide-react'

import {
  getSettings,
  updateAccountSettings,
  updateBusinessSettings,
  changePassword,
} from '../services/settingsService'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100'

const labelClass = 'mb-2 block text-sm font-medium text-slate-700'

function Settings() {
  const [settings, setSettings] = useState(null)
  const [account, setAccount] = useState({ name: '', email: '' })
  const [business, setBusiness] = useState({
    name: '',
    industry: '',
    description: '',
  })

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [loading, setLoading] = useState(true)
  const [savingAccount, setSavingAccount] = useState(false)
  const [savingBusiness, setSavingBusiness] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getSettings()
      const currentSettings = data.settings

      setSettings(currentSettings)
      setAccount(currentSettings.account)
      setBusiness(currentSettings.business)
    } catch (err) {
      setError(err.message || 'Failed to load settings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const showSuccess = (message) => {
    setError('')
    setSuccess(message)
  }

  const handleAccountUpdate = async (e) => {
    e.preventDefault()

    try {
      setSavingAccount(true)
      setError('')
      setSuccess('')

      await updateAccountSettings(account)
      await fetchSettings()

      showSuccess('Account details updated successfully.')
    } catch (err) {
      setError(err.message || 'Failed to update account details.')
    } finally {
      setSavingAccount(false)
    }
  }

  const handleBusinessUpdate = async (e) => {
    e.preventDefault()

    try {
      setSavingBusiness(true)
      setError('')
      setSuccess('')

      await updateBusinessSettings(business)
      await fetchSettings()

      showSuccess('Business profile updated successfully.')
    } catch (err) {
      setError(err.message || 'Failed to update business profile.')
    } finally {
      setSavingBusiness(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New password and confirm password do not match.')
      setSuccess('')
      return
    }

    if (passwords.newPassword.length < 8) {
      setError('New password must contain at least 8 characters.')
      setSuccess('')
      return
    }

    try {
      setSavingPassword(true)
      setError('')
      setSuccess('')

      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })

      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      showSuccess(
        'Password changed successfully. Please log in again with your new password.'
      )
    } catch (err) {
      setError(err.message || 'Failed to change password.')
    } finally {
      setSavingPassword(false)
    }
  }

  const SectionHeading = ({ icon: Icon, title, description }) => (
    <div className="mb-6 flex items-start gap-3">
      <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
        <Icon size={21} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  )

  const SaveButton = ({ loading: isSaving, label }) => (
    <button
      type="submit"
      disabled={isSaving}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSaving ? (
        <LoaderCircle size={17} className="animate-spin" />
      ) : (
        <Save size={17} />
      )}
      {isSaving ? 'Saving...' : label}
    </button>
  )

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <LoaderCircle className="animate-spin text-violet-600" size={22} />
          Loading settings...
        </div>
      </div>
    )
  }

  if (!settings && error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={fetchSettings}
          className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600">
            <ShieldCheck size={23} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Settings
          </h1>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Manage your account, business profile and security preferences.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Account Settings */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeading
          icon={UserRound}
          title="Account Settings"
          description="Manage your personal account information."
        />

        <form onSubmit={handleAccountUpdate} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                Full Name
              </label>
              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  required
                  value={account.name}
                  onChange={(e) =>
                    setAccount({ ...account, name: e.target.value })
                  }
                  className={`${inputClass} pl-11`}
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  required
                  value={account.email}
                  onChange={(e) =>
                    setAccount({ ...account, email: e.target.value })
                  }
                  className={`${inputClass} pl-11`}
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <SaveButton loading={savingAccount} label="Save Account" />
          </div>
        </form>
      </section>

      {/* Business Profile */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeading
          icon={Building2}
          title="Business Profile"
          description="Update the information associated with your business workspace."
        />

        <form onSubmit={handleBusinessUpdate} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                Business Name
              </label>
              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  required
                  value={business.name}
                  onChange={(e) =>
                    setBusiness({ ...business, name: e.target.value })
                  }
                  className={`${inputClass} pl-11`}
                  placeholder="Enter business name"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Industry
              </label>
              <div className="relative">
                <BriefcaseBusiness
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  required
                  value={business.industry}
                  onChange={(e) =>
                    setBusiness({ ...business, industry: e.target.value })
                  }
                  className={`${inputClass} pl-11`}
                  placeholder="e.g. Retail, Technology"
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Business Description
            </label>
            <div className="relative">
              <FileText
                size={18}
                className="absolute left-4 top-4 text-slate-400"
              />
              <textarea
                rows={4}
                value={business.description}
                onChange={(e) =>
                  setBusiness({
                    ...business,
                    description: e.target.value,
                  })
                }
                className={`${inputClass} resize-none pl-11`}
                placeholder="Tell us a little about your business..."
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <SaveButton loading={savingBusiness} label="Save Business Profile" />
          </div>
        </form>
      </section>

      {/* Security Settings */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeading
          icon={LockKeyhole}
          title="Security"
          description="Keep your account secure by updating your password."
        />

        <form onSubmit={handlePasswordUpdate} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass}>
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    currentPassword: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>

            <div>
              <label className={labelClass}>
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    newPassword: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="Enter new password"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className={labelClass}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <SaveButton loading={savingPassword} label="Update Password" />
          </div>
        </form>
      </section>
    </div>
  )
}

export default Settings
