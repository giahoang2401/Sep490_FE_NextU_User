"use client";
import { useAccount } from "@/components/account/AccountContext";
import { useState, useMemo, useEffect } from "react";
import api from "@/utils/axiosConfig";

const fetchProfile = async () => {
  const res = await api.get("/api/user/profiles/profileme");
  return res.data;
};

export default function InterestsPage() {
  const data = useAccount();
  const setAccount = data.setAccount;
  const [allInterests, setAllInterests] = useState<{id: string, name: string}[]>([]);
  const [selected, setSelected] = useState<string[]>([]); // store selected ids
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchInterests() {
      try {
        const res = await api.get("/api/user/interests");
        if (Array.isArray(res.data)) {
          setAllInterests(res.data.map((item: any) => ({ id: item.id, name: item.name })));
        }
      } catch (err) {
        setAllInterests([]);
      }
    }
    fetchInterests();
  }, []);

  useEffect(() => {
    // Convert data.interests to array of ids for selected state
    let initialSelected: string[] = [];
    if (Array.isArray(data.interests)) {
      // If backend returns array of names, map to ids
      initialSelected = allInterests.filter(i => data.interests.includes(i.name)).map(i => i.id);
    } else if (typeof data.interests === "string" && data.interests) {
      const names = data.interests.split(",").map((s: string) => s.trim()).filter(Boolean);
      initialSelected = allInterests.filter(i => names.includes(i.name)).map(i => i.id);
    }
    setSelected(initialSelected);
  }, [data.interests, allInterests]);

  const filtered = useMemo(
    () =>
      allInterests.filter(
        (tag) => tag.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search, allInterests]
  );

  const toggleTag = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch("/api/user/profiles/updateprofile", {
        fullName: data.fullName || "",
        phone: data.phone || "",
        gender: data.gender || "",
        dob: data.dob || "",
        avatarUrl: data.avatarUrl || "",
        socialLinks: data.socialLinks || "",
        address: data.address || "",
        skills: data.skills || "",
        personalityTraits: data.personalityTraits || "",
        introduction: data.introduction || "",
        cvUrl: data.cvUrl || "",
        note: data.note || "",
        interestIds: selected
      });
      if (setAccount) setAccount(res.data.data);
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
        <h1 className="text-3xl font-bold">Interests</h1>
      </div>
      <div className="bg-white rounded-lg shadow p-8 max-w-3xl">
        <input
          className="w-full border rounded px-3 py-2 mb-6"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 mb-6">
          {filtered.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1 rounded border text-sm transition-all ${
                selected.includes(tag.id)
                  ? "bg-red-200 border-red-400 text-red-700 font-semibold"
                  : "bg-white border-red-200 text-gray-700 hover:bg-red-50"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
        <button
          className="px-6 py-2 bg-black text-white rounded disabled:opacity-50"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {message && <div className="mt-2 text-sm text-blue-600">{message}</div>}
      </div>
    </div>
  );
} 