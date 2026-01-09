import React, { useState } from "react";
import http from "../api/http";

export default function AdminItems() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);

    try {
      await http.post("/api/admin/items", { name, description });
      setMsg("Item created successfully.");
      setName("");
      setDescription("");
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2.message || "Failed to create item");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6">
      <div>
        <div className="text-lg font-semibold text-slate-900">Admin Add Item</div>
        <div className="text-sm text-slate-600">Directly create an item (Admin only)</div>
      </div>

      <form
        onSubmit={submit}
        className="mt-4 max-w-xl bg-white border border-slate-200 rounded-2xl p-5 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
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

        {err && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
            {err}
          </div>
        )}
        {msg && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
            {msg}
          </div>
        )}

        <button
          disabled={busy}
          className="px-4 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create Item"}
        </button>
      </form>
    </div>
  );
}
