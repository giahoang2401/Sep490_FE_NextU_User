"use client";
import { useAccount } from "@/components/account/AccountContext";
import { useState, useRef } from "react";
import api from "@/utils/axiosConfig";

export default function PhotoDescriptionPage() {
  const data = useAccount();
  const [introduction, setIntroduction] = useState(data.introduction || "");
  const [cvUrl, setCvUrl] = useState(data.cvUrl || "");
  const [socialLinks, setSocialLinks] = useState(data.socialLinks || "");
  const [note, setNote] = useState(data.note || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(data.avatarUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };
  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarUrl(e.target.value);
    setAvatarPreview(e.target.value);
    setAvatarFile(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/api/user/profiles/updateprofile", {
        fullName: data.fullName || "",
        phone: data.phone || "",
        gender: data.gender || "",
        dob: data.dob || "",
        avatarUrl: avatarFile ? avatarPreview : avatarUrl,
        socialLinks,
        address: data.address || "",
        interests: data.interests || "",
        personalityTraits: data.personalityTraits || "",
        introduction,
        cvUrl,
        note,
      });
      setMessage("Saved successfully!");
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("Error saving. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Photo & Description</h1>
      </div>
      <div className="bg-white rounded-2xl shadow p-10 max-w-6xl mx-auto flex gap-16 items-start">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4 w-72">
          <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-5xl overflow-hidden relative group">
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span>📷</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleAvatarFileChange}
            />
            <button
              type="button"
              className="absolute bottom-2 right-2 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition group-hover:opacity-100 opacity-90"
              onClick={() => fileInputRef.current?.click()}
              title="Upload from device"
              style={{zIndex: 2}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
              </svg>
            </button>
          </div>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-base shadow-sm"
            value={avatarUrl}
            onChange={handleAvatarUrlChange}
            placeholder="Or paste image URL here"
          />
          <span className="text-gray-500 text-base text-center">
            Upload a photo of yourself that clearly shows your face.<br />
            Hosts like knowing they're interacting with an actual human.
          </span>
        </div>
        {/* Introduction & new fields */}
        <div className="flex-1 flex flex-col gap-4">
          <label className="font-bold text-lg mb-2">Tell us about yourself</label>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm resize-none"
            rows={6}
            value={introduction}
            onChange={e => setIntroduction(e.target.value)}
          />
          {introduction.length >= 50 ? (
            <div className="text-green-600 mt-1 text-sm">Well done! Your description is now long enough.</div>
          ) : (
            <div className="text-red-600 mt-1 text-sm">Please write at least 50 characters.</div>
          )}
          <label className="font-bold text-lg mt-4">CV URL</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm"
            value={cvUrl}
            onChange={e => setCvUrl(e.target.value)}
            placeholder="Enter your CV URL"
          />
          <label className="font-bold text-lg mt-4">Social Links</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm"
            value={socialLinks}
            onChange={e => setSocialLinks(e.target.value)}
            placeholder="Enter your social links"
          />
          <label className="font-bold text-lg mt-4">Note</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Enter a note"
          />
          <div className="flex justify-end">
            <button
              className="mt-2 px-8 py-2 bg-black text-white rounded-xl text-base font-semibold disabled:opacity-50"
              onClick={handleSave}
              disabled={saving || introduction.length < 50}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
          {message && <div className="mt-2 text-sm text-blue-600">{message}</div>}
        </div>
      </div>
    </div>
  );
} 