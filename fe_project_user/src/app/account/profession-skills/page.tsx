"use client";
import { useAccount } from "@/components/account/AccountContext";
import { useState, useMemo } from "react";
import api from "@/utils/axiosConfig";

const ALL_SKILLS = [
  "A/B testing", "AI", "API development", "Accounting", "Administrative support", "Advertising", "Affiliate marketing", "Android development", "Animators", "Audio production", "Back-end development", "Blogging", "Bookkeeping", "Brand strategy", "Branding", "Business development", "CRM management", "Communication", "Community management", "Content", "Content marketing", "Copyediting", "Copywriting", "Creative writing", "Crowd-funding", "Customer research", "Customer service", "Data analysis", "Data entry", "Data mining", "Data visualization", "Database administration", "Design", "Digital marketing", "Digital photography", "Direct marketing", "Display advertising", "E-books", "E-commerce", "Editing", "Education technology", "Email marketing", "Entrepreneurship", "Event management", "Events", "Excel", "Financial planning", "Front-end development", "Fundraising", "Game development", "Google Ads", "Google Analytics", "Grant writing", "Graphic design", "Growth hacking", "Hacking", "Human resources", "Illustration", "InDesign", "Internet marketing", "Internet startups", "Investing", "Journalist", "Lead generation", "Leadership", "Lean startups", "Management consulting", "Market research", "Marketing", "Media relations", "Mobile advertisement", "Mobile design", "Mobile development", "Negotiation", "Networking", "Newsletters", "Paralegal services"
];

export default function ProfessionSkillsPage() {
  const data = useAccount();
  const [selected, setSelected] = useState<string[]>(
    data.personalityTraits ? data.personalityTraits.split(",").map((s: string) => s.trim()).filter(Boolean) : []
  );
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = useMemo(
    () =>
      ALL_SKILLS.filter(
        (tag) => tag.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const toggleTag = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/api/user/profiles/updateprofile", {
        fullName: data.fullName || "",
        phone: data.phone || "",
        gender: data.gender || "",
        dob: data.dob || "",
        avatarUrl: data.avatarUrl || "",
        socialLinks: data.socialLinks || "",
        address: data.address || "",
        interests: data.interests || "",
        skills: data.skills || "",
        personalityTraits: selected.join(", "),
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
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded border text-sm transition-all ${
                selected.includes(tag)
                  ? "bg-red-200 border-red-400 text-red-700 font-semibold"
                  : "bg-white border-red-200 text-gray-700 hover:bg-red-50"
              }`}
            >
              {tag}
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