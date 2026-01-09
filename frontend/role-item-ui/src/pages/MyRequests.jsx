import React, { useEffect, useState } from "react";
import http from "../api/http";

export default function MyRequests() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [appealMessage, setAppealMessage] = useState({});
  const [requests, setRequests] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await http.get("/api/requests/mine");
      setRequests(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createRequest(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      await http.post("/api/requests", { name, description });
      setName("");
      setDescription("");
      setMsg("Request submitted (Pending).");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to create request");
    }
  }

  async function submitAppeal(requestId) {
    setErr("");
    setMsg("");

    const message = (appealMessage[requestId] || "").trim();
    if (!message) {
      setErr("Appeal message is required.");
      return;
    }

    try {
      await http.post(`/api/requests/${requestId}/appeal`, { appealMessage: message });
      setMsg("Appeal submitted.");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to submit appeal");
    }
  }

  return (
    <div className="p-6">
      <div>
        <div className="text-lg font-semibold text-slate-900">My Requests</div>
        <div className="text-sm text-slate-600">Create requests and track status</div>
      </div>

      <form
        onSubmit={createRequest}
        className="mt-4 max-w-xl bg-white border border-slate-200 rounded-2xl p-5 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Item Name</label>
          <input
            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
        </div>

        <button className="px-4 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
          Submit Request
        </button>
      </form>

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
              <th className="text-left px-4 py-3 border-b border-slate-200">Status</th>
              <th className="text-left px-4 py-3 border-b border-slate-200">Deny Reason</th>
              <th className="text-left px-4 py-3 border-b border-slate-200">Appeal</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-slate-600" colSpan={5}>
                  Loading…
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-600" colSpan={5}>
                  No requests yet.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.requestId} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3 text-slate-700">{r.requestId}</td>
                  <td className="px-4 py-3 text-slate-900 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-slate-700">{r.status}</td>
                  <td className="px-4 py-3 text-slate-700">{r.denyReason ?? "-"}</td>
                  <td className="px-4 py-3">
                    {r.status === "Denied" ? (
                      <div className="space-y-2">
                        <textarea
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                          rows={2}
                          placeholder="Write appeal message…"
                          value={appealMessage[r.requestId] || ""}
                          onChange={(e) =>
                            setAppealMessage((p) => ({ ...p, [r.requestId]: e.target.value }))
                          }
                        />
                        <button
                          onClick={() => submitAppeal(r.requestId)}
                          className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100"
                        >
                          Submit Appeal
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
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
