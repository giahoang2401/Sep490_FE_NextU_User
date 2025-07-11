"use client";
import { useAccount } from "@/components/account/AccountContext";
import { useState, useMemo } from "react";
import api from "@/utils/axiosConfig";

const ALL_INTERESTS = [
  "Adventure travel", "Alternative energy", "Alternative medicine", "Animal welfare", "Astronomy", "Athletics", "Backpacking", "Badminton", "Baseball", "Basketball", "Beer tasting", "Bicycling", "Board games", "Bowling", "Brunch", "Camping", "Clubbing", "Comedy", "Conservation", "Cooking", "Crafts", "DIY – Do it Yourself", "Dancing", "Dining out", "Diving", "Drinking", "Education technology", "Entrepreneurship", "Environmental awareness", "Fencing", "Film", "Finance technology", "Fishing", "Fitness", "Frisbee", "Gaming", "Golf", "Happy hour", "Healing", "Hiking", "History", "Holistic health", "Horse riding", "Human rights", "Hunting", "Ice skating", "Innovation", "International travel", "Internet startups", "Investing", "Karaoke", "Kayaking", "Languages", "Literature", "Local culture", "Marketing", "Martial arts", "Meditation", "Mountain biking", "Music", "Natural parks", "Networking", "Neuroscience", "Nightlife", "Nutrition", "Outdoor adventure", "Outdoor sports", "Painting", "Photography", "Ping pong", "Polo", "Programming", "Public speaking", "Reading", "Religion", "Renewable energy", "Robotics", "Rock climbing", "Rugby", "Running", "Sailing", "Self-exploration", "Shooting & Archery", "Sightseeing", "Skiing", "Skydiving", "Snorkeling", "Snowboarding", "Soccer", "Social entrepreneurship", "Social movements", "Software development", "Spiritual growth", "Spirituality", "Squash", "Startups", "Stress relief", "Surfing", "Sustainability", "Swimming", "Tennis", "Theatre", "Travel", "Travel photography", "Venture capital", "Volleyball", "Volunteering", "Walking", "Web design", "Web development", "Wellness", "Wine tasting", "Writing", "Yoga"
];

export default function InterestsPage() {
  const data = useAccount();
  const [selected, setSelected] = useState<string[]>(
    data.interests ? data.interests.split(",").map((s: string) => s.trim()).filter(Boolean) : []
  );
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = useMemo(
    () =>
      ALL_INTERESTS.filter(
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
        skills: data.skills || "",
        personalityTraits: data.personalityTraits || "",
        introduction: data.introduction || "",
        cvUrl: data.cvUrl || "",
        note: data.note || "",
        interests: selected.join(", ")
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