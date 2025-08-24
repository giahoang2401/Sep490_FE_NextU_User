"use client";
import { useAccount } from "@/components/account/AccountContext";
import { useState, useRef } from "react";
import api from "@/utils/axiosConfig";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, Upload, X } from "lucide-react";

const fetchProfile = async () => {
  const res = await api.get("/api/user/profiles/profileme");
  return res.data;
};

export default function PhotoDescriptionPage() {
  const data = useAccount();
  const setAccount = data.setAccount;
  const [introduction, setIntroduction] = useState(data.introduction || "");
  const [cvUrl, setCvUrl] = useState(data.cvUrl || "");
  const [socialLinks, setSocialLinks] = useState(data.socialLinks || "");
  const [note, setNote] = useState(data.note || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl || "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(data.avatarUrl || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const uploadImage = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('File', file);
      
      const response = await api.post('/api/Files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update form data with image URL
      setAvatarUrl(response.data.url);
      
      return response.data;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle image selection for avatar
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload image immediately
      uploadImage(file);
    }
  };

  // Remove image for avatar
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setAvatarUrl("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch("/api/user/profiles/updateprofile", {
        fullName: data.fullName || "",
        phone: data.phone || "",
        gender: data.gender || "",
        dob: data.dob || "",
        avatarUrl: avatarUrl,
        socialLinks,
        address: data.address || "",
        interests: data.interests || "",
        personalityTraits: data.personalityTraits || "",
        introduction,
        cvUrl,
        note,
      });
      if (setAccount) setAccount(res.data.data);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/account/interests");
      }, 2000);
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
            {imagePreview ? (
              <img src={imagePreview} alt="avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span>📷</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            <button
              type="button"
              className="absolute bottom-2 right-2 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition group-hover:opacity-100 opacity-90"
              onClick={() => fileInputRef.current?.click()}
              title="Upload from device"
              style={{zIndex: 2}}
              disabled={isUploadingImage}
            >
              {isUploadingImage ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Upload className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
          
          {/* Image upload status and controls */}
          <div className="w-full space-y-2">
            {selectedImage && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 truncate flex-1">
                  {selectedImage.name}
                </span>
                <button
                  type="button"
                  onClick={removeImage}
                  className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {isUploadingImage && (
              <div className="text-sm text-blue-600 text-center">
                Uploading image...
              </div>
            )}
            
            {avatarUrl && !isUploadingImage && (
              <div className="text-sm text-green-600 text-center">
                ✓ Image uploaded successfully
              </div>
            )}
          </div>
          
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
              disabled={saving || introduction.length < 50 || isUploadingImage}
            >
              {saving ? "Saving..." : "Continue"}
            </button>
          </div>
          {message && <div className="mt-2 text-sm text-blue-600">{message}</div>}
        </div>
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
    </div>
  );
} 