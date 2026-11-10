
import { Search, Bell, HelpCircle, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Topbar() {
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          placeholder="Search anything..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Right section */}
      <div className="ml-6 flex items-center gap-5">
        <HelpCircle size={20} className="text-slate-500" />
        <Bell size={20} className="text-slate-500" />

        <div className="h-8 border-l border-slate-200" />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-slate-500">
              Business Workspace
            </p>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="ml-2 rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Topbar
