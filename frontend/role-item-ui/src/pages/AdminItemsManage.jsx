import React, { useEffect, useMemo, useState } from "react";
import http from "../api/http";

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="text-lg font-semibold text-slate-900">{title}</div>
      {subtitle && <div className="text-sm text-slate-600 mt-1">{subtitle}</div>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function AdminItemsManage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [edit, setEdit] = useState({}); // { [itemId]: { name, description } }
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await http.get("/api/admin/items");
      setItems(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load items.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(() => {
    const arr = [...items];
    arr.sort((a, b) => (b.itemId ?? 0) - (a.itemId ?? 0));
    return arr;
  }, [items]);

  function startEdit(it) {
    setEdit((p) => ({
      ...p,
      [it.itemId]: {
        name: it.name ?? "",
        description: it.description ?? "",
      },
    }));
  }

  function cancelEdit(itemId) {
    setEdit((p) => {
      const copy = { ...p };
      delete copy[itemId];
      return copy;
    });
  }

  async function save(itemId) {
    setErr("");
    setMsg("");

    const payload = edit[itemId];
    if (!payload) return;

    if (!payload.name.trim() || !payload.description.trim()) {
      setErr("Name and Description are required.");
      return;
    }

    setBusyId(itemId);
    try {
      await http.put(`/api/admin/items/${itemId}`, {
        name: payload.name.trim(),
        description: payload.description.trim(),
      });
      setMsg(`Updated item #${itemId}.`);
      cancelEdit(itemId);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(itemId, name) {
    setErr("");
    setMsg("");

    const ok = confirm(`Delete item "${name}" (ID ${itemId})? This cannot be undone.`);
    if (!ok) return;

    setBusyId(itemId);
    try {
      await http.delete(`/api/admin/items/${itemId}`);
      setMsg(`Deleted item #${itemId}.`);
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
          <div className="text-lg font-semibold text-slate-900">Manage Items</div>
          <div className="text-sm text-slate-600">Edit or delete items (Admin only)</div>
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

      <Card title="Items" subtitle="Inline edit + delete">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="text-left px-4 py-3 border-b border-slate-200">Id</th>
                <th className="text-left px-4 py-3 border-b border-slate-200">Name</th>
                <th className="text-left px-4 py-3 border-b border-slate-200">Description</th>
                <th className="text-left px-4 py-3 border-b border-slate-200">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={4}>
                    Loading…
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={4}>
                    No items found.
                  </td>
                </tr>
              ) : (
                sorted.map((it) => {
                  const isEditing = !!edit[it.itemId];
                  const model = edit[it.itemId] || {
                    name: it.name,
                    description: it.description,
                  };

                  return (
                    <tr key={it.itemId} className="border-t border-slate-100 align-top">
                      <td className="px-4 py-3 text-slate-700">{it.itemId}</td>

                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                            value={model.name}
                            onChange={(e) =>
                              setEdit((p) => ({
                                ...p,
                                [it.itemId]: { ...p[it.itemId], name: e.target.value },
                              }))
                            }
                            disabled={busyId === it.itemId}
                          />
                        ) : (
                          <div className="text-slate-900 font-medium">{it.name}</div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {isEditing ? (
                          <textarea
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                            rows={2}
                            value={model.description}
                            onChange={(e) =>
                              setEdit((p) => ({
                                ...p,
                                [it.itemId]: { ...p[it.itemId], description: e.target.value },
                              }))
                            }
                            disabled={busyId === it.itemId}
                          />
                        ) : (
                          <div className="text-slate-700">{it.description}</div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {!isEditing ? (
                            <>
                              <button
                                onClick={() => startEdit(it)}
                                className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                                disabled={busyId === it.itemId}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => remove(it.itemId, it.name)}
                                className="px-3 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                                disabled={busyId === it.itemId}
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => save(it.itemId)}
                                className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                disabled={busyId === it.itemId}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => cancelEdit(it.itemId)}
                                className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                                disabled={busyId === it.itemId}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
