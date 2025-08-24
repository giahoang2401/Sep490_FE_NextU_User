"use client";
import { useAccount } from "@/components/account/AccountContext";
import { useState, useMemo, useEffect } from "react";
import api from "@/utils/axiosConfig";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

const fetchProfile = async () => {
  const res = await api.get("/api/user/profiles/profileme");
  return res.data;
};

export default function ProfessionSkillsPage() {
  const data = useAccount();
  const setAccount = data.setAccount;
  const [allSkills, setAllSkills] = useState<{id: string, name: string}[]>([]);
  const [selected, setSelected] = useState<string[]>([]); // store selected ids
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchSkills() {
      try {
        const res = await api.get("/api/user/interests/personality");
        if (Array.isArray(res.data)) {
          setAllSkills(res.data.map((item: any) => ({ id: item.id, name: item.name })));
        }
      } catch (err) {
        setAllSkills([]);
      }
    }
    fetchSkills();
  }, []);

  useEffect(() => {
    // Convert data.personalityTraits to array of ids for selected state
    let initialSelected: string[] = [];
    if (Array.isArray(data.personalityTraits)) {
      initialSelected = allSkills.filter(i => data.personalityTraits.includes(i.name)).map(i => i.id);
    } else if (typeof data.personalityTraits === "string" && data.personalityTraits) {
      const names = data.personalityTraits.split(",").map((s: string) => s.trim()).filter(Boolean);
      initialSelected = allSkills.filter(i => names.includes(i.name)).map(i => i.id);
    }
    setSelected(initialSelected);
  }, [data.personalityTraits, allSkills]);

  const filtered = useMemo(
    () =>
      allSkills.filter(
        (tag) => tag.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search, allSkills]
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
        interests: data.interests || "",
        skills: data.skills || "",
        personalityTraitIds: selected,
        introduction: data.introduction || "",
        cvUrl: data.cvUrl || "",
        note: data.note || "",
      });
      if (setAccount) setAccount(res.data.data);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/account/my-profile");
      }, 2000);
    } catch {
      setMessage("Error saving. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Skills and expertise</h1>
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
          {saving ? "Saving..." : "Complete"}
        </button>
        <Dialog open={showSuccess}>
          <DialogContent className="bg-green-50 text-center">
            <div className="flex flex-col items-center justify-center py-2">
              <CheckCircle2 className="text-green-600 mb-2" size={48} />
              <DialogTitle className="text-green-700 text-2xl font-bold">Profile updated!</DialogTitle>
              <DialogDescription className="text-green-700 mt-2">Your information has been saved successfully.</DialogDescription>
            </div>
          </DialogContent>
        </Dialog>
        {message && <div className="mt-2 text-sm text-blue-600">{message}</div>}
      </div>
    </div>
  );
} 