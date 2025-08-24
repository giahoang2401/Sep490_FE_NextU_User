"use client";
import React, { useState } from "react";
import { useAccount } from "@/components/account/AccountContext";
import api from "@/utils/axiosConfig";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

const fetchProfile = async () => {
  const res = await api.get("/api/user/profiles/profileme");
  return res.data;
};

export default function AboutMePage() {
  const data = useAccount();
  const setAccount = data.setAccount;
  const [fullName, setFullName] = useState(data.fullName || "");
  const [dob, setDob] = useState(data.dob ? data.dob.split('T')[0] : "");
  const [gender, setGender] = useState(data.gender || "");
  const [phone, setPhone] = useState(data.phone || "");
  const [address, setAddress] = useState(data.address || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch("/api/user/profiles/updateprofile", {
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
      if (setAccount) setAccount(res.data.data);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/account/photo-description");
      }, 2000);
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
            {saving ? "Saving..." : "Continue"}
          </button>
        </div>
        <Dialog open={showSuccess}>
          <DialogContent className="bg-green-50 text-center">
            <div className="flex flex-col items-center justify-center py-2">
              <CheckCircle2 className="text-green-600 mb-2" size={48} />
              <DialogTitle className="text-green-700 text-2xl font-bold">Profile updated!</DialogTitle>
              <DialogDescription className="text-green-700 mt-2">Your information has been saved successfully.</DialogDescription>
            </div>
          </DialogContent>
        </Dialog>
      </form>
    </div>
  );
} 