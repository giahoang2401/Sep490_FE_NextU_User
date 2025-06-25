"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit } from "lucide-react";
import axios from "axios";

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
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.warn("Missing access_token");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/bff/api/user/profiles/profileme", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch profile:", res.status);
          return;
        }

        const data = await res.json();
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
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:5000/bff/api/user/profiles/updateprofile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessage(response.data.message);
        setIsEditing(false);
        
        // CẬP NHẬT USER STATE VỚI DATA MỚI
        const updatedUser = { ...user, ...formData };
        setUser(updatedUser);
        
        // Tùy chọn: Tự động ẩn message sau 3 giây
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to update profile", error);
      setMessage("Đã xảy ra lỗi khi cập nhật hồ sơ.");
      
      // Tự động ẩn error message sau 3 giây
      setTimeout(() => {
        setMessage(null);
      }, 3000);
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
              <select
                name="gender"
                value={formData.gender}
                disabled={!isEditing}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="rounded-xl border px-3 py-2 w-full"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : name === "dob" ? (
              <Input
                name="dob"
                type="date"
                value={formData.dob}
                disabled={!isEditing}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
                className="rounded-xl"
              />
            ) : (
              <Input
                name={name}
                value={formData[name]}
                disabled={!isEditing}
                onChange={handleChange}
                className="rounded-xl"
              />
            )}
          </div>
        );
      })}

      <div className="pt-4 flex gap-4">
        {isEditing ? (
          <>
            <Button
              onClick={handleSave}
              className="rounded-full bg-slate-800"
            >
              Save Changes
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            className="rounded-full bg-slate-800"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

}