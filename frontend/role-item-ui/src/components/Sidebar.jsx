import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LinkItem({ to, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "relative block px-3 py-2 rounded-xl text-sm transition select-none",
          "focus:outline-none focus:ring-2 focus:ring-[#6DC3BB]/40",
          // BASE (inactive): ghost look (not filled)
          "border border-transparent text-white/85 hover:text-white",
          "hover:bg-white/8 hover:border-white/10",
          // ACTIVE: filled + stronger contrast
          isActive
            ? "bg-[#0F3F3C] text-white border-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.25)]"
            : "",
        ].join(" ")
      }
    >
      {/* left accent for active */}
      <span
        className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-[#6DC3BB] opacity-0"
        aria-hidden="true"
      />
      <span className="relative">{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-64 min-h-[calc(100vh-56px)] border-r border-black/10 bg-[#134E4A] p-4">
      <div className="text-xs uppercase tracking-wide text-white/55 mb-3">
        Navigation
      </div>

      <div className="space-y-2">
        <LinkItem to="/items" label="Items" end />

        {user?.role === "User" && (
          <LinkItem to="/my-requests" label="My Requests" end />
        )}

        {user?.role === "Admin" && (
          <div className="pt-2">
            <div className="text-[11px] uppercase tracking-wide text-white/45 mb-2">
              Admin
            </div>

            <div className="space-y-2">
              <LinkItem to="/admin/requests" label="Admin Requests" end />
              <LinkItem to="/admin/items" label="Admin Add Item" end />
              <LinkItem to="/admin/users" label="Admin Users" end />
              <LinkItem to="/admin/items/manage" label="Manage Items" end />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-[11px] text-white/45">
        luxury • minimal • fast
      </div>
    </aside>
  );
}
