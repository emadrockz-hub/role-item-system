import React, { useEffect, useState } from "react";
import http from "../api/http";
import PageShell from "../components/PageShell";

export default function Items() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await http.get("/api/items");
      setItems(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <PageShell
      title="Items"
      subtitle="All available items"
      right={
        <button
  onClick={load}
  className="text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition"
>
  Refresh
</button>

      }
    >
      {err && (
        <div className="mb-4 text-sm text-rose-200 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
          {err}
        </div>
      )}

     <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
  <table className="w-full text-sm">
    <thead className="bg-[#6DC3BB]/12 text-slate-800">
      <tr>
        <th className="text-left px-4 py-3 border-b border-slate-200">Name</th>
        <th className="text-left px-4 py-3 border-b border-slate-200">Description</th>
      </tr>
    </thead>

    <tbody className="bg-white">
      {loading ? (
        <tr>
          <td className="px-4 py-4 text-slate-600" colSpan={2}>
            Loading…
          </td>
        </tr>
      ) : items.length === 0 ? (
        <tr>
          <td className="px-4 py-4 text-slate-600" colSpan={2}>
            No items found.
          </td>
        </tr>
      ) : (
        items.map((it) => (
          <tr
            key={it.itemId ?? it.id ?? it.name}
            className="border-t border-slate-100 hover:bg-[#6DC3BB]/10 transition"
          >
            <td className="px-4 py-3 text-slate-900 font-medium">{it.name}</td>
            <td className="px-4 py-3 text-slate-700">{it.description}</td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

    </PageShell>
  );
}
