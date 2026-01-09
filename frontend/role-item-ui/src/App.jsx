import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import RequireAuth from "./components/RequireAuth";
import ShellLayout from "./components/ShellLayout";

import Login from "./pages/Login";
import Items from "./pages/Items";
import MyRequests from "./pages/MyRequests";
import AdminRequests from "./pages/AdminRequests";
import AdminItems from "./pages/AdminItems";
import NotFound from "./pages/NotFound";
import AdminUsers from "./pages/AdminUsers";
import AdminItemsManage from "./pages/AdminItemsManage";

export default function App() {
  return (
    <Routes>
<Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Protected area */}
      <Route element={<RequireAuth />}>
        <Route element={<ShellLayout />}>
          <Route path="/items" element={<Items />} />

          {/* User only */}
          <Route element={<RequireAuth allowedRoles={["User"]} />}>
            <Route path="/my-requests" element={<MyRequests />} />
          </Route>

          {/* Admin only */}
          <Route element={<RequireAuth allowedRoles={["Admin"]} />}>
            <Route path="/admin/requests" element={<AdminRequests />} />
            <Route path="/admin/items" element={<AdminItems />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/items/manage" element={<AdminItemsManage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
