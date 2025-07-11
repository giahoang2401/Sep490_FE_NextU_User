"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit } from "lucide-react";
import api from "@/utils/axiosConfig";

export default function ProfileInfo() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: "",
    dob: "",
    avatarUrl: "",
    socialLinks: "",
    address: "",
    interests: "",
    personalityTraits: "",
    introduction: "",
    cvUrl: "",
    note: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/user/profiles/profileme");
        const data = response.data || response; // fallback nếu api đã custom trả về data luôn
        setUser(data);
        setFormData({
          fullName: data.fullName || "",
          phone: data.phone || "",
          gender: data.gender || "",
          dob: data.dob?.split("T")[0] || "",
          avatarUrl: data.avatarUrl || "",
          socialLinks: data.socialLinks || "",
          address: data.address || "",
          interests: data.interests || "",
          personalityTraits: data.personalityTraits || "",
          introduction: data.introduction || "",
          cvUrl: data.cvUrl || "",
          note: data.note || "",
        });
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await api.put(
        "/api/user/profiles/updateprofile",
        formData
      );
      const resData = response.data || response;
      if (resData.success) {
        setMessage(resData.message);
        setIsEditing(false);
        // CẬP NHẬT USER STATE VỚI DATA MỚI
        const updatedUser = { ...user, ...formData };
        setUser(updatedUser);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("Failed to update profile", error);
      setMessage("Đã xảy ra lỗi khi cập nhật hồ sơ.");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (!user) return <div className="text-center mt-10">Loading...</div>;

  return (
  <Card className="max-w-4xl mx-auto rounded-2xl border-0 shadow-lg">
    <CardHeader className="text-center">
      <Avatar className="w-24 h-24 mx-auto mb-4">
        <AvatarImage
          src={formData.avatarUrl || "/default-avatar.png"}
          alt="Avatar"
        />
        <AvatarFallback>{formData.fullName?.charAt(0)}</AvatarFallback>
      </Avatar>
      <CardTitle>{formData.fullName}</CardTitle>
      <p className="text-sm text-gray-500">{formData.socialLinks}</p>
    </CardHeader>

    {message && (
      <div className="text-center text-green-600 font-medium text-sm mb-4 px-4">
        {message}
      </div>
    )}

    <CardContent className="space-y-4">
      {(
        [
          { label: "Full Name", name: "fullName" },
          { label: "Phone", name: "phone" },
          { label: "Gender", name: "gender" },
          { label: "Date of Birth", name: "dob" },
          { label: "Avatar URL", name: "avatarUrl" },
          { label: "Social Link", name: "socialLinks" },
          { label: "Address", name: "address" },
          { label: "Interests", name: "interests" },
          { label: "Personality Traits", name: "personalityTraits" },
          { label: "Introduction", name: "introduction" },
          { label: "CV URL", name: "cvUrl" },
          { label: "Note", name: "note" },
        ] as const
      ).map(({ label, name }) => {
        return (
          <div key={name}>
            <Label>{label}</Label>
            {name === "gender" ? (
              <div className="rounded-xl border px-3 py-2 w-full bg-gray-100">{formData.gender}</div>
            ) : name === "dob" ? (
              <div className="rounded-xl border px-3 py-2 w-full bg-gray-100">{formData.dob}</div>
            ) : (
              <div className="rounded-xl border px-3 py-2 w-full bg-gray-100 break-all">{formData[name]}</div>
            )}
          </div>
        );
      })}
    </CardContent>
  </Card>
);

}