"use client";
import { useState } from "react";
import api from "@/utils/axiosConfig";

export default function PasswordPage() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    if (!current || !newPass || !confirm) {
      setMessage("Please fill all fields.");
      return;
    }
    if (newPass !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await api.patch("/api/user/profiles/updatepassword", { currentPassword: current, newPassword: newPass });
      setMessage("Password changed successfully!");
      setTimeout(() => setMessage(""), 2000);
      setCurrent(""); setNewPass(""); setConfirm("");
    } catch {
      setMessage("Error changing password. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Password</h1>
      </div>
      <div className="bg-white rounded-lg shadow p-8 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="font-semibold mb-1 block">Current password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              placeholder="Current password"
            />
          </div>
          <div>
            <label className="font-semibold mb-1 block">New password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              placeholder="New password"
            />
          </div>
          <div>
            <label className="font-semibold mb-1 block">Confirm new password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <a href="/forgot-password" className="text-sm text-gray-500 hover:underline">Forgot password?</a>
          <button
            className="px-6 py-2 bg-black text-white rounded disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        {message && <div className="mt-2 text-sm text-blue-600">{message}</div>}
      </div>
    </div>
  );
} 