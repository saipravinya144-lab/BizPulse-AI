
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  MessageSquare,
  Bot,
  Megaphone,
  FileText,
  Settings,
  Store,
  PanelLeftClose,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Sales', path: '/sales', icon: ShoppingCart },
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Customer Feedback', path: '/feedback', icon: MessageSquare },
  { name: 'AI Assistant', path: '/assistant', icon: Bot },
  { name: 'Marketing Studio', path: '/marketing', icon: Megaphone },
  { name: 'Business Reports', path: '/reports', icon: FileText },
]

function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Store size={22} />
        </div>

        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
            BizPulse <span className="text-indigo-600">AI</span>
          </h1>
          <p className="text-xs text-slate-500">Business Copilot</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        {navigation.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={19} />
              {item.name}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-100 p-4">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Settings size={19} />
          Settings
        </NavLink>

        <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
            BP
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">My Business</p>
            <p className="text-xs text-slate-500">Business Workspace</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
