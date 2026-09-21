import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import Cookies from "js-cookie";
import { Search, Bell, ChevronDown, LogOut } from "lucide-react";
import logo from "../asset/logo.jpeg";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", to: "/admin/dashboard", end: true },
  { key: "exams", label: "Exams", to: "/admin/exams" },
  { key: "questions", label: "Question Bank", to: "/admin/questions" },
  { key: "candidates", label: "Candidates", to: "/admin/candidates" },
  { key: "reports", label: "Reports", to: "/admin/reports" },
  { key: "settings", label: "Settings", to: "/admin/settings" },
];

function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AdminLayout() {
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const adminName = localStorage.getItem("name") || "Admin";

  const notifications = [
    { id: 1, text: "New candidate registered", time: "5 min ago" },
    { id: 2, text: "Exam published successfully", time: "30 min ago" },
    { id: 3, text: "Evaluator completed review", time: "2 hrs ago" },
  ];

  function logout() {
    Cookies.remove("exam_token");
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#f9f8f4] text-[#241f13]">
      {/* Top Bar */}
      <header className="h-16 flex-shrink-0 flex items-center gap-6 px-6 py-4 bg-white border-b border-[#e5e1d5] z-20">
        <div className="flex items-center flex-shrink-0">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
        </div>

        <div className="flex-1 max-w-[440px] flex items-center gap-2.5 bg-[#f3f1e9] border border-[#e5e1d5] rounded-xl px-3.5 py-2 text-[#6b6354]">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent outline-none text-sm text-[#241f13] placeholder:text-[#a39c8a]"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              className="relative w-100 h-100 rounded-xl border border-[#e5e1d5] bg-[#f3f1e9] flex items-center justify-center text-[#6b6354] hover:border-[#b3781f] hover:text-[#b3781f] transition-colors"
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
            >
              <Bell size={18} />

              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#c23b3b] text-white text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                  {notifications.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute top-[calc(100%+8px)] right-0 w-[300px] bg-white border border-[#e5e1d5] rounded-2xl shadow-2xl shadow-[#241f13]/10 overflow-hidden z-30">
                <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b6354] border-b border-[#e5e1d5]">
                  Notifications
                </div>

                {notifications.map((item) => (
                  <div key={item.id} className="px-4 py-3 border-b border-[#e5e1d5] last:border-b-0">
                    <p className="m-0 text-sm text-[#241f13]">{item.text}</p>
                    <span className="text-xs text-[#a39c8a]">{item.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              className="flex items-center gap-2 bg-[#f3f1e9] border border-[#e5e1d5] rounded-xl pl-1.5 pr-3 py-1.5 hover:border-[#b3781f] transition-colors"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
            >
              <span className="w-7 h-7 rounded-lg bg-[#0f7a5f] text-[#eafbf4] font-bold text-xs flex items-center justify-center flex-shrink-0">
                {initials(adminName)}
              </span>

              <span className="text-sm font-medium whitespace-nowrap hidden sm:inline">
                {adminName}
              </span>

              <ChevronDown size={14} className="text-[#6b6354]" />
            </button>

            {profileOpen && (
              <div className="absolute top-[calc(100%+8px)] right-0 w-[190px] bg-white border border-[#e5e1d5] rounded-2xl shadow-2xl shadow-[#241f13]/10 overflow-hidden p-1.5 z-30">
                <button
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-[#241f13] hover:bg-[#f3f1e9] transition-colors"
                  onClick={() => navigate("/admin/settings")}
                >
                  Account Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-16 md:w-56 flex-shrink-0 bg-white border-r border-[#e5e1d5] p-3 h-full overflow-y-auto">
          <nav className="h-full flex flex-col justify-between">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-center md:text-left ${
                      isActive
                        ? "bg-[#fbeed9] text-[#b3781f] font-semibold"
                        : "text-[#6b6354] hover:bg-[#f3f1e9] hover:text-[#241f13]"
                    }`
                  }
                >
                  <span className="md:hidden">{item.label[0]}</span>
                  <span className="hidden md:inline">{item.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Fixed Bottom Logout */}
            <div className="border-t border-[#e5e1d5] pt-3 mt-3">
              <button
                className="w-full flex items-center justify-center md:justify-start gap-2 border border-[#e5e1d5] text-[#c23b3b] px-3.5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#fbe9e9] hover:border-[#c23b3b] transition-colors"
                onClick={logout}
              >
                <LogOut size={16} />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Page */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}