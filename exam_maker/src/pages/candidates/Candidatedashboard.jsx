import {
  GraduationCap,
  LayoutDashboard,
  CalendarClock,
  ClipboardCheck,
  User,
  Bell,
  HelpCircle,
  LogOut,
  ChevronDown,
  Clock3,
  ListChecks,
  BarChart3,
  Calendar,
  ChevronRight,
  Wifi,
  TriangleAlert,
  Pencil,
  Headphones,
  Code2,
  Atom,
  FileCode,
  Sparkles,
  CircleAlert,
  ArrowRight,
} from "lucide-react";

import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { getAssignedExam } from "../../api/api";
import ExamListSkeleton from "../../components/candidate/common/ExamListSkeleton";

const JOIN_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const DIFFICULTY_STYLES = {
  Easy: "bg-emerald-50 text-emerald-700",
  Medium: "bg-amber-50 text-amber-700",
  Hard: "bg-rose-50 text-rose-700",
};

// Cosmetic per-card theming — cycles for whatever list length comes back.
// Swap the icon lookup below for real subject/category data if you have it.
const CARD_THEMES = [
  { icon: FileCode, iconBg: "bg-indigo-100", iconColor: "text-indigo-600", badgeBg: "bg-indigo-50", badgeText: "text-indigo-700" },
  { icon: Atom, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", badgeBg: "bg-emerald-50", badgeText: "text-emerald-700" },
  { icon: Code2, iconBg: "bg-amber-100", iconColor: "text-amber-600", badgeBg: "bg-amber-50", badgeText: "text-amber-700" },
];

function themeFor(index) {
  return CARD_THEMES[index % CARD_THEMES.length];
}

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
  { label: "My Exams", icon: CalendarClock, key: "exams" },
  { label: "Results", icon: ClipboardCheck, key: "results" },
  { label: "Profile", icon: User, key: "profile" },
  { label: "Notifications", icon: Bell, key: "notifications" },
  { label: "Help & Support", icon: HelpCircle, key: "help" },
];



export default function CandidateDashboard({
  candidateId = "",
  memberSince = "",
  notificationCount = 0,
}) {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const candidateName = storedUser?.name || "Candidate";
  const candidateEmail = storedUser?.email || "";

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState("dashboard");

  const navigate = useNavigate();

  function logout() {
    Cookies.remove("exam_token");
    localStorage.clear();
    navigate("/login");
  }

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAssignedExam();
      const list = response?.data ?? [];

      const sorted = [...list].sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
      );

      setExams(sorted);
    } catch (err) {
      console.error("Failed to load upcoming exams", err);
      setError("Couldn't load your exams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        activeNav={activeNav}
        onNavClick={setActiveNav}
        onLogout={logout}
      />

      <div className="flex-1 min-w-0">
        <TopBar
          candidateName={candidateName}
          candidateEmail={candidateEmail}
          notificationCount={notificationCount}
          onLogout={logout}
          onProfile={() => navigate("/profile")}
        />

        <main className="p-6 md:p-10">
          <div className="max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
              {/* Left / main column */}
              <div className="min-w-0">
                <div className="mb-6">
                  <p className="text-slate-500">Welcome back,</p>
                  <h1 className="text-3xl font-semibold text-slate-900 mt-0.5 flex items-center gap-2">
                    {candidateName} <span aria-hidden>👋</span>
                  </h1>
                  <p className="text-slate-500 mt-1">
                    Here's what's happening with your exams.
                  </p>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Upcoming Exams
                  </h2>
                  <button
                    onClick={() => navigate("/exams")}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                  >
                    View All Exams
                    <ChevronRight size={16} />
                  </button>
                </div>

                {loading ? (
                  <ExamListSkeleton />
                ) : error ? (
                  <ErrorState message={error} onRetry={fetchExams} />
                ) : exams.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-4">
                    {exams.map((exam, i) => (
                      <ExamRow
                        key={exam.assignment_id}
                        exam={exam}
                        theme={themeFor(i)}
                        onEnter={() =>
                          navigate(`/exams/${exam.assignment_id}`, {
                            state: { exam },
                          })
                        }
                        onDetails={() => navigate(`/exams/${exam.exam_id}`)}
                      />
                    ))}
                  </div>
                )}

                {!loading && !error && exams.length > 0 && (
                  <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                        <Calendar size={18} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          Stay prepared and do your best!
                        </p>
                        <p className="text-sm text-slate-500 truncate">
                          Make sure to read the instructions carefully before
                          starting the exam.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/instructions")}
                      className="shrink-0 text-sm font-medium px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      View Instructions
                    </button>
                  </div>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <CandidateInfoCard
                  name={candidateName}
                  email={candidateEmail}
                  candidateId={candidateId}
                  memberSince={memberSince}
                />
                <QuickTips />
                <NeedHelp onContact={() => navigate("/support")} />
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-10">
              © {new Date().getFullYear()} ExamPortal. All rights reserved.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ activeNav, onNavClick, onLogout }) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 bg-slate-950 text-white flex-col justify-between min-h-screen">
      <div>
        <div className="p-6 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold leading-tight">ExamPortal</p>
            <p className="text-xs text-slate-400 leading-tight">
              Candidate Portal
            </p>
          </div>
        </div>

        <nav className="px-3 mt-2 space-y-1">
          {NAV_ITEMS.map(({ label, icon: Icon, key }) => {
            const active = key === activeNav;
            return (
              <button
                key={key}
                onClick={() => onNavClick(key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      <div>
        <div className="px-6 pb-2 opacity-80">
          <svg viewBox="0 0 200 140" className="w-full h-auto" aria-hidden="true">
            <circle cx="40" cy="30" r="3" fill="#38bdf8" opacity="0.6" />
            <circle cx="160" cy="20" r="2" fill="#38bdf8" opacity="0.4" />
            <circle cx="20" cy="90" r="2" fill="#38bdf8" opacity="0.5" />
            <rect x="55" y="70" width="70" height="55" rx="8" fill="#1e293b" />
            <circle cx="90" cy="55" r="18" fill="#334155" />
            <rect x="60" y="95" width="60" height="28" rx="6" fill="#2563eb" opacity="0.85" />
          </svg>
        </div>
        <div className="border-t border-white/10 p-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function TopBar({ candidateName, candidateEmail, notificationCount, onLogout, onProfile }) {
  return (
    <header className="h-20 flex items-center justify-end gap-5 px-6 md:px-10 border-b border-slate-200 bg-slate-50">
      <button
        aria-label="Notifications"
        className="relative h-10 w-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200/60 transition-colors"
      >
        <Bell size={20} />
        {notificationCount > 0 && (
          <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-semibold flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </button>

      <ProfileMenu
        name={candidateName}
        email={candidateEmail}
        onLogout={onLogout}
        onProfile={onProfile}
      />
    </header>
  );
}

function ProfileMenu({ name, email, onLogout, onProfile }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-slate-200/60 transition-colors"
      >
        <span className="h-9 w-9 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
          {getInitials(name)}
        </span>
        <span className="hidden sm:block text-sm font-medium text-slate-800 max-w-[10rem] truncate">
          {name}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-20"
        >
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-900 truncate">{name}</p>
            {email && (
              <p className="text-xs text-slate-500 truncate">{email}</p>
            )}
          </div>
          <MenuItem icon={User} label="View profile" onClick={() => { setOpen(false); onProfile?.(); }} />
          <div className="border-t border-slate-100" />
          <MenuItem
            icon={LogOut}
            label="Log out"
            danger
            onClick={() => { setOpen(false); onLogout?.(); }}
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors ${danger ? "text-rose-600 hover:bg-rose-50" : "text-slate-700 hover:bg-slate-50"
        }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

function ExamRow({ exam, theme, onEnter, onDetails }) {
  const { label, isJoinable, isExpired } = useCountdown(
    exam.start_time,
    exam.duration,
    exam.assignment_status
  );
  const Icon = theme.icon;

  const startDate = new Date(exam.start_time);
  const dateTimeLabel = Number.isNaN(startDate.getTime())
    ? "Date unavailable"
    : `${startDate.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}, ${startDate.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    })}`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-5">
      <div className={`h-14 w-14 rounded-xl ${theme.iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={24} className={theme.iconColor} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900 truncate">{exam.title}</h3>
        {exam.description && (
          <p className="text-sm text-slate-500 mt-0.5 truncate">{exam.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          <Pill icon={Clock3}>{exam.duration} min</Pill>
          <Pill icon={ListChecks}>{exam?.total_questions ?? "—"} Questions</Pill>
          {exam.difficulty && (
            <Pill icon={BarChart3} className={DIFFICULTY_STYLES[exam.difficulty] || "bg-slate-100 text-slate-600"}>
              {exam.difficulty}
            </Pill>
          )}
        </div>
        <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-2.5">
          <Calendar size={13} />
          {dateTimeLabel}
        </p>
      </div>

      <div className="flex flex-col items-stretch md:items-end gap-2.5 shrink-0">
        <div className={`text-center px-4 py-1.5 rounded-lg ${theme.badgeBg}`}>
          <p className={`text-[11px] font-medium ${theme.badgeText} opacity-80`}>
            {isExpired ? "Status" : "Starts in"}
          </p>
          <p className={`text-sm font-semibold ${theme.badgeText}`}>{label}</p>
        </div>

        {isExpired ? (
          <button
            onClick={onDetails}
            className="text-sm font-medium px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
        ) : isJoinable ? (
          <button
            onClick={onEnter}
            className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Enter Exam
            <ArrowRight size={15} />
          </button>
        ) : (
          <button
            onClick={onDetails}
            className="text-sm font-medium px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
}

function Pill({ icon: Icon, children, className = "bg-slate-100 text-slate-600" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>
      <Icon size={12} />
      {children}
    </span>
  );
}

function CandidateInfoCard({ name, email, candidateId, memberSince }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-slate-900 font-semibold mb-4">
        <User size={17} className="text-blue-600" />
        Candidate Info
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="h-11 w-11 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center shrink-0">
          {getInitials(name)}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{name}</p>
          {email && <p className="text-xs text-slate-500 truncate">{email}</p>}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 space-y-3">
        {candidateId && (
          <div>
            <p className="text-xs text-slate-500">Candidate ID</p>
            <p className="text-sm font-medium text-blue-600">{candidateId}</p>
          </div>
        )}
        {memberSince && (
          <div>
            <p className="text-xs text-slate-500">Member Since</p>
            <p className="text-sm font-medium text-slate-800">{memberSince}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const TIPS = [
  { icon: Wifi, text: "Ensure stable internet connection before starting the exam." },
  { icon: TriangleAlert, text: "Do not refresh or close the browser during the exam." },
  { icon: Pencil, text: "You can review and change your answers before submitting." },
  { icon: Clock3, text: "Submit the exam before the time runs out." },
];

function QuickTips() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-slate-900 font-semibold mb-4">
        <Sparkles size={17} className="text-amber-500" />
        Quick Tips
      </div>
      <div className="space-y-3.5">
        {TIPS.map(({ icon: Icon, text }, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Icon size={15} className="text-slate-500" />
            </span>
            <p className="text-sm text-slate-600 leading-snug">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NeedHelp({ onContact }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
      <p className="font-semibold text-slate-900 mb-1">Need Help?</p>
      <p className="text-sm text-slate-600 mb-4">
        Contact our support team if you face any issues.
      </p>
      <button
        onClick={onContact}
        className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        <Headphones size={16} />
        Contact Support
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-slate-300 rounded-2xl p-12 text-center bg-white">
      <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
        <Sparkles size={20} className="text-slate-400" />
      </div>
      <h3 className="text-slate-800 font-medium">No exams scheduled</h3>
      <p className="text-sm text-slate-500 mt-1.5 max-w-xs mx-auto">
        Nothing's booked right now. Once an exam is assigned to you, it'll
        show up here.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="border border-rose-200 bg-rose-50 rounded-2xl p-8 text-center">
      <CircleAlert size={22} className="text-rose-500 mx-auto mb-3" />
      <p className="text-sm text-slate-700">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 text-sm px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-white transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

// Live "boarding" countdown to an exam's start time — ticks every second
// once close, and can be entered a few minutes ahead via JOIN_WINDOW_MS.
function useCountdown(startTime, duration, assignmentStatus) {
  const target = useMemo(() => new Date(startTime).getTime(), [startTime]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Assignment-level status takes priority over wall-clock time —
  // a candidate who already finished or timed out should never see
  // a live countdown or a joinable button again.
  if (assignmentStatus === "COMPLETED") {
    return { label: "Completed", isJoinable: false, isPast: true, isExpired: true };
  }
  if (assignmentStatus === "EXPIRED") {
    return { label: "Expired", isJoinable: false, isPast: true, isExpired: true };
  }
  if (Number.isNaN(target)) {
    return { label: "Time unavailable", isJoinable: false, isPast: false, isExpired: false };
  }

  const durationMs = Number(duration || 0) * 60 * 1000;
  const examEnd = target + durationMs;
  const diff = target - now;
  const pad = (n) => String(n).padStart(2, "0");

  if (now >= examEnd) {
    return { label: "Exam ended", isJoinable: false, isPast: true, isExpired: true };
  }

  // Assignment already started, or exam is currently running — always
  // joinable while we're before examEnd.
  if (assignmentStatus === "IN_PROGRESS" || (now >= target && now < examEnd)) {
    const remainingSeconds = Math.floor((examEnd - now) / 1000);
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    return {
      label: `Ends in ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
      isJoinable: true,
      isPast: true,
      isExpired: false,
    };
  }

  // Exam is upcoming but inside join window
  if (diff <= JOIN_WINDOW_MS) {
    const totalSeconds = Math.floor(diff / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return {
      label: `Starts in ${pad(minutes)}:${pad(seconds)}`,
      isJoinable: true,
      isPast: false,
      isExpired: false,
    };
  }

  // Exam is further out
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const label = days > 0 ? `${days}d ${hours}h` : `${pad(hours)}:${pad(minutes)}`;

  return { label, isJoinable: false, isPast: false, isExpired: false };
}