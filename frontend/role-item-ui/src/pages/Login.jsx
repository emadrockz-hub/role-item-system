import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/items";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-[#0B2F2D]">
      <div className="w-full max-w-md rounded-3xl p-[1px] bg-white/15 shadow-[0_40px_90px_rgba(0,0,0,0.45)]">
        <div className="rounded-3xl bg-white/95 backdrop-blur border border-white/15 p-6">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-[#6DC3BB]" />
            <div className="text-xl font-semibold text-slate-900">Login</div>
          </div>

          <div className="text-sm text-slate-600 mt-1">
            Use your username & password to continue.
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Username</label>
              <input
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6DC3BB]/55"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6DC3BB]/55"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
                {error}
              </div>
            )}

            <button
              disabled={busy}
              className="w-full px-4 py-2.5 rounded-xl bg-[#134E4A] text-white hover:opacity-95 disabled:opacity-60 transition shadow-sm"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>

            <div className="text-xs text-slate-500">
              Tip: If you’re Admin you’ll see Admin menus after login.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
