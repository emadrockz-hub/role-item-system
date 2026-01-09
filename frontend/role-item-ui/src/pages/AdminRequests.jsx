import React, { useEffect, useState } from "react";
import http from "../api/http";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [denyReasons, setDenyReasons] = useState({});
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await http.get("/api/admin/requests");
      setRequests(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load admin requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id) {
    setErr("");
    setMsg("");
    try {
      await http.post(`/api/admin/requests/${id}/approve`);
      setMsg(`Approved request #${id} (item created).`);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Approve failed");
    }
  }

  async function deny(id) {
    setErr("");
    setMsg("");
    const reason = (denyReasons[id] || "").trim();
    if (!reason) {
      setErr("Deny reason is required.");
      return;
    }

    try {
      await http.post(`/api/admin/requests/${id}/deny`, { denyReason: reason });
      setMsg(`Denied request #${id}.`);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Deny failed");
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-900">Admin Requests</div>
          <div className="text-sm text-slate-600">Approve / deny item requests</div>
        </div>
        <button
          onClick={load}
          className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {err && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {err}
        </div>
      )}
      {msg && (
        <div className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
          {msg}
        </div>
      )}

      <div className="mt-4 bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="text-left px-4 py-3 border-b border-slate-200">Id</th>
              <th className="text-left px-4 py-3 border-b border-slate-200">Name</th>
              <th className="text-left px-4 py-3 border-b border-slate-200">Requested By</th>
              <th className="text-left px-4 py-3 border-b border-slate-200">Status</th>
              <th className="text-left px-4 py-3 border-b border-slate-200">Deny Reason</th>
              <th className="text-left px-4 py-3 border-b border-slate-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-slate-600" colSpan={6}>
                  Loading…
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-600" colSpan={6}>
                  No requests found.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.requestId} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3 text-slate-700">{r.requestId}</td>
                  <td className="px-4 py-3 text-slate-900 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-slate-700">{r.requestedByUsername}</td>
                  <td className="px-4 py-3 text-slate-700">{r.status}</td>
                  <td className="px-4 py-3 text-slate-700">{r.denyReason ?? "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      {(r.status === "Pending" || r.status === "Denied") && (
                        <button
                          onClick={() => approve(r.requestId)}
                          className="text-sm px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                        >
                          Approve
                        </button>
                      )}

                      {r.status === "Pending" && (
                        <>
                          <input
                            value={denyReasons[r.requestId] || ""}
                            onChange={(e) =>
                              setDenyReasons((p) => ({ ...p, [r.requestId]: e.target.value }))
                            }
                            placeholder="Deny reason (required)"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                          />
                          <button
                            onClick={() => deny(r.requestId)}
                            className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100"
                          >
                            Deny
                          </button>
                        </>
                      )}

                      {r.reviewedByAdminUsername && (
                        <div className="text-xs text-slate-500">
                          Reviewed by: {r.reviewedByAdminUsername}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
