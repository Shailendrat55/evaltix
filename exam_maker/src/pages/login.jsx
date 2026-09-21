import { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { login } from "../api/api";
import logo from "../asset/logo.jpeg";
import "./login.css";

const ROLES = [
  {
    key: "ADMIN",
    tabLabel: "Admin",
    credentialLabel: "Password",
    placeholder: "Enter your password",
    inputType: "password",
    redirectTo: "/admin/dashboard",
  },
  {
    key: "CANDIDATE",
    tabLabel: "Candidate",
    credentialLabel: "Access Code",
    placeholder: "8-character access code",
    inputType: "text",
    maxLength: 8,
    redirectTo: "/rules",
  },
  {
    key: "EVALUATOR",
    tabLabel: "Evaluator",
    credentialLabel: "Password",
    placeholder: "Enter your password",
    inputType: "password",
    redirectTo: "/evaluator/queue",
  },
];

export default function Login() {
  const [activeRole, setActiveRole] = useState("ADMIN");
  const [email, setEmail] = useState("");
  const [credential, setCredential] = useState("");
  const [showCredential, setShowCredential] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const roleConfig = ROLES.find((r) => r.key === activeRole);

  const handleTabChange = (roleKey) => {
    if (roleKey === activeRole) return;
    setActiveRole(roleKey);
    setCredential("");
    setShowCredential(false);
    setError("");
  };

  const handleCredentialChange = (e) => {
    let value = e.target.value;
    if (activeRole === "CANDIDATE") {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    }
    setCredential(value);
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }
    if (!credential) {
      setError(`${roleConfig.credentialLabel} is required`);
      return;
    }
    if (activeRole === "CANDIDATE" && credential.length !== 8) {
      setError("Access code must be 8 characters");
      return;
    }

    setLoading(true);
    const res = await login({ email: trimmedEmail, credential });
    setLoading(false);

    if (!res) return;

    const { accessToken, user } = res.data;

    if (user.role !== activeRole) {
      setError(
        `This account is registered as ${user.role.toLowerCase()}. Switch tabs and try again.`
      );
      return;
    }

    Cookies.set("exam_token", accessToken, { expires: rememberMe ? 30 : 1 });
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userId", user.id);
    localStorage.setItem("role", user.role);

    switch (user.role) {
      case "ADMIN":
        navigate("/admin/dashboard");
        break;
      case "CANDIDATE":
        navigate("/CandidateDashboard");
        break;
      case "EVALUATOR":
        navigate("/evaluator/queue");
        break;
      default:
        navigate("/login");
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-card">
          <div className="login-brand">
            <img src={logo} alt="EVALTIX" className="login-logo" />
            <span className="login-wordmark">EVALTIX</span>
          </div>
          <p className="subtitle">Sign in to continue</p>

          <div className="role-tabs" role="tablist">
            {ROLES.map((role) => (
              <button
                key={role.key}
                type="button"
                role="tab"
                aria-selected={activeRole === role.key}
                className={`role-tab ${activeRole === role.key ? "active" : ""}`}
                onClick={() => handleTabChange(role.key)}
              >
                {role.tabLabel}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} noValidate>
            <div className="input-group">
              <label htmlFor="login-email" className="input-label">
                Email address
              </label>
              <div className="field-shell">
                <Mail size={16} className="field-icon" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  placeholder="Enter your email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="login-credential" className="input-label">
                {roleConfig.credentialLabel}
              </label>
              <div className="field-shell">
                <Lock size={16} className="field-icon" />
                <input
                  id="login-credential"
                  type={
                    activeRole !== "CANDIDATE" && showCredential
                      ? "text"
                      : roleConfig.inputType
                  }
                  required
                  placeholder={roleConfig.placeholder}
                  value={credential}
                  maxLength={roleConfig.maxLength}
                  onChange={handleCredentialChange}
                  className={activeRole === "CANDIDATE" ? "credential-mono" : ""}
                  autoComplete={
                    activeRole === "CANDIDATE" ? "off" : "current-password"
                  }
                />
                {activeRole !== "CANDIDATE" && (
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => setShowCredential((v) => !v)}
                    tabIndex={-1}
                    aria-label={showCredential ? "Hide password" : "Show password"}
                  >
                    {showCredential ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
              {activeRole === "CANDIDATE" && (
                <span className="input-hint">
                  {credential.length}/8 characters
                </span>
              )}
            </div>

            <div className="form-row">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="/forgot-password" className="forgot-link">
                Forgot password?
              </a>
            </div>

            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in as {roleConfig.tabLabel}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="secure-access">
            <ShieldCheck size={14} />
            Secure access
          </div>
        </div>

        <p className="footer-text">
          © {new Date().getFullYear()} EVALTIX. All rights reserved.
        </p>
      </div>

      <div className="login-hero">
        <div className="hero-copy">
          <h1>Exams made easy. Results that empower.</h1>
          <p>All-in-one platform for exam management and evaluation.</p>
        </div>

        <div className="hero-illustration">
          <svg viewBox="0 0 420 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="210" cy="300" rx="150" ry="24" fill="#F3E8FF" />
            <rect x="60" y="220" width="80" height="60" rx="6" fill="#7C3AED" opacity="0.15" />
            <rect x="64" y="210" width="72" height="16" rx="4" fill="#7C3AED" opacity="0.3" />
            <g>
              <rect x="150" y="60" width="140" height="200" rx="14" fill="#FFFFFF" stroke="#DDD6FE" strokeWidth="3" />
              <rect x="190" y="48" width="60" height="24" rx="8" fill="#7C3AED" />
              {[105, 145, 185, 225].map((y, i) => (
                <g key={y}>
                  <rect x="172" y={y} width="16" height="16" rx="4" fill="none" stroke="#A78BFA" strokeWidth="2" />
                  {i < 3 && <path d={`M175 ${y + 8} l3 3 l6 -7`} stroke="#7C3AED" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
                  <rect x="198" y={y + 4} width="70" height="8" rx="4" fill="#EDE9FE" />
                </g>
              ))}
            </g>
            <g transform="translate(268 150)">
              <circle cx="0" cy="0" r="42" fill="#FDBA74" opacity="0.25" />
              <circle cx="0" cy="0" r="34" fill="#FFFFFF" stroke="#FB923C" strokeWidth="4" />
              <line x1="0" y1="0" x2="0" y2="-20" stroke="#FB923C" strokeWidth="3" strokeLinecap="round" />
              <line x1="0" y1="0" x2="14" y2="6" stroke="#FB923C" strokeWidth="3" strokeLinecap="round" />
              <rect x="-6" y="-46" width="12" height="10" rx="2" fill="#FB923C" />
            </g>
            <g transform="translate(255 250)">
              <path d="M0 40 L60 40 L52 6 Q30 -6 8 6 Z" fill="#3B0764" />
              <rect x="-6" y="38" width="72" height="8" rx="2" fill="#4C1D95" />
              <circle cx="60" cy="38" r="4" fill="#F59E0B" />
              <line x1="60" y1="38" x2="66" y2="52" stroke="#F59E0B" strokeWidth="2" />
            </g>
            <circle cx="40" cy="60" r="6" fill="#F9A8D4" opacity="0.7" />
            <circle cx="370" cy="90" r="5" fill="#C4B5FD" opacity="0.7" />
            <circle cx="360" cy="270" r="7" fill="#FDBA74" opacity="0.6" />
          </svg>
        </div>
      </div>
    </div>
  );
}