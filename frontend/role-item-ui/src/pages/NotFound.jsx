import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 p-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full">
        <div className="text-lg font-semibold text-slate-900">404 — Not Found</div>
        <div className="mt-2 text-slate-600">That page doesn’t exist.</div>
        <Link
          to="/items"
          className="inline-block mt-4 text-sm px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
        >
          Go to Items
        </Link>
      </div>
    </div>
  );
}
