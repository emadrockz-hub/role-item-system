import React, { useEffect, useMemo, useState } from "react";
import http from "../api/http";

const roles = ["User", "Admin"];

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="text-lg font-semibold text-slate-900">{title}</div>
      {subtitle && <div className="text-sm text-slate-600 mt-1">{subtitle}</div>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Create user form
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("User");
  const [creating, setCreating] = useState(false);

  // Reset password per-user input
  const [resetPw, setResetPw] = useState({}); // { [userId]: "newpass" }
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await http.get("/api/admin/users");
      setUsers(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const sortedUsers = useMemo(() => {
    const arr = [...users];
    arr.sort((a, b) => (b.userId ?? 0) - (a.userId ?? 0));
    return arr;
  }, [users]);

  async function createUser(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (newUsername.trim().length < 3) {
      setErr("Username must be at least 3 characters.");
      return;
    }
    if (newPassword.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }

    setCreating(true);
    try {
      // Your backend expects CreateUserRequest (DTO) with username/password/role
      await http.post("/api/admin/users", {
        username: newUsername.trim(),
        password: newPassword,
        role: newRole,
      });

      setMsg("User created.");
      setNewUsername("");
      setNewPassword("");
      setNewRole("User");
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2.message || "Create user failed.");
    } finally {
      setCreating(false);
    }
  }

  async function changeRole(userId, role) {
    setErr("");
    setMsg("");
    setBusyId(userId);
    try {
      await http.put(`/api/admin/users/${userId}/role`, { role });
      setMsg(`Updated role for user #${userId}.`);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Update role failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function resetPassword(userId) {
    setErr("");
    setMsg("");

    const pw = (resetPw[userId] || "").trim();
    if (pw.length < 6) {
      setErr("New password must be at least 6 characters.");
      return;
    }

    setBusyId(userId);
    try {
      await http.post(`/api/admin/users/${userId}/reset-password`, { newPassword: pw });
      setMsg(`Password reset for user #${userId}.`);
      setResetPw((p) => ({ ...p, [userId]: "" }));
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Reset password failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteUser(userId, username) {
    setErr("");
    setMsg("");

    const ok = confirm(`Delete user "${username}" (ID ${userId})? This cannot be undone.`);
    if (!ok) return;

    setBusyId(userId);
    try {
      await http.delete(`/api/admin/users/${userId}`);
      setMsg(`Deleted user #${userId}.`);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-900">Admin Users</div>
          <div className="text-sm text-slate-600">Create users, update roles, reset passwords</div>
        </div>
        <button
          onClick={load}
          className="text-sm px-3 py-1.5 rounded-lg bg-white/70 border border-slate-200 hover:bg-white"
        >
          Refresh
        </button>
      </div>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
          {err}
        </div>
      )}
      {msg && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          {msg}
        </div>
      )}

      <Card title="Create User" subtitle="Admin can create User/Admin accounts">
        <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <input
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <select
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button
            disabled={creating}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {creating ? "Creating…" : "Create"}
          </button>
        </form>
      </Card>

      <Card title="Users" subtitle="Manage roles, reset passwords, delete">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="text-left px-4 py-3 border-b border-slate-200">Id</th>
                <th className="text-left px-4 py-3 border-b border-slate-200">Username</th>
                <th className="text-left px-4 py-3 border-b border-slate-200">Role</th>
                <th className="text-left px-4 py-3 border-b border-slate-200">Reset Password</th>
                <th className="text-left px-4 py-3 border-b border-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={5}>
                    Loading…
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={5}>
                    No users found.
                  </td>
                </tr>
              ) : (
                sortedUsers.map((u) => (
                  <tr key={u.userId} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3 text-slate-700">{u.userId}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">{u.username}</td>
                    <td className="px-4 py-3">
                      <select
                        className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        value={u.role}
                        onChange={(e) => changeRole(u.userId, e.target.value)}
                        disabled={busyId === u.userId}
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <input
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                          placeholder="New password"
                          type="password"
                          value={resetPw[u.userId] || ""}
                          onChange={(e) =>
                            setResetPw((p) => ({ ...p, [u.userId]: e.target.value }))
                          }
                          disabled={busyId === u.userId}
                        />
                        <button
                          onClick={() => resetPassword(u.userId)}
                          disabled={busyId === u.userId}
                          className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          Reset
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteUser(u.userId, u.username)}
                        disabled={busyId === u.userId}
                        className="px-3 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
