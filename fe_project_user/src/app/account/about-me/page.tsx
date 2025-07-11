"use client";
import React, { useState } from "react";
import { useAccount } from "@/components/account/AccountContext";
import api from "@/utils/axiosConfig";

export default function AboutMePage() {
  const data = useAccount();
  const [fullName, setFullName] = useState(data.fullName || "");
  const [dob, setDob] = useState(data.dob ? data.dob.split('T')[0] : "");
  const [gender, setGender] = useState(data.gender || "");
  const [phone, setPhone] = useState(data.phone || "");
  const [address, setAddress] = useState(data.address || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/api/user/profiles/updateprofile", {
        fullName,
        phone,
        gender,
        dob,
        avatarUrl: data.avatarUrl || "",
        socialLinks: data.socialLinks || "",
        address,
        interests: data.interests || "",
        personalityTraits: data.personalityTraits || "",
        introduction: data.introduction || "",
        cvUrl: data.cvUrl || "",
        note: data.note || "",
      });
      setMessage("Saved successfully!");
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("Error saving. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <form className="bg-white rounded-2xl shadow p-10 w-full" onSubmit={e => {e.preventDefault(); handleSave();}}>
        <div className="space-y-8">
          <div className="flex items-center">
            <label className="w-56 font-bold text-lg text-left">Full name</label>
            <input
              className="flex-1 h-12 border border-gray-200 rounded-xl px-4 text-base shadow-sm"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center">
            <label className="w-56 font-bold text-lg text-left">Birthday</label>
            <input
              type="date"
              className="flex-1 h-12 border border-gray-200 rounded-xl px-4 text-base shadow-sm"
              value={dob}
              onChange={e => setDob(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center">
            <label className="w-56 font-bold text-lg text-left">Gender</label>
            <select
              className="flex-1 h-12 border border-gray-200 rounded-xl px-4 text-base shadow-sm"
              value={gender}
              onChange={e => setGender(e.target.value)}
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex items-center">
            <label className="w-56 font-bold text-lg text-left">Phone</label>
            <input
              className="flex-1 h-12 border border-gray-200 rounded-xl px-4 text-base shadow-sm"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center">
            <label className="w-56 font-bold text-lg text-left">Address</label>
            <input
              className="flex-1 h-12 border border-gray-200 rounded-xl px-4 text-base shadow-sm"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex justify-end mt-8">
          <button
            type="submit"
            className="px-8 py-2 bg-black text-white rounded-xl text-base font-semibold disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        {message && <div className="mt-2 text-sm text-blue-600 text-right">{message}</div>}
      </form>
    </div>
  );
} 