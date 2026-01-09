import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  const showRole =
    user?.role &&
    user?.username &&
    String(user.role).toLowerCase() !== String(user.username).toLowerCase();

  return (
    <header className="h-14 px-4 flex items-center justify-between bg-[#134E4A] border-b border-black/10">
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-[#6DC3BB]" />
        <div className="font-semibold text-white">Role-Based Item Manager</div>
        <div className="hidden sm:block text-xs text-white/70 ml-2">
          clean • secure • controlled
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="text-sm px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/15">
            <span className="font-semibold">{user.username}</span>
            {showRole && <span className="opacity-80"> · {user.role}</span>}
          </div>
        )}

        <button
          onClick={logout}
          className="text-sm px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/15 hover:bg-white/15 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
