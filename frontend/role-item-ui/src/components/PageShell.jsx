import React from "react";

export default function PageShell({ title, subtitle, right, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold text-slate-900">{title}</div>
          {subtitle && <div className="text-sm text-slate-600 mt-1">{subtitle}</div>}
        </div>

        {right && <div className="shrink-0">{right}</div>}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
