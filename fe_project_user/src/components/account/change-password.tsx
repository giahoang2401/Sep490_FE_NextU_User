"use client";
import { useState } from "react";
import api from "@/utils/axiosConfig";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordPage() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  
  // Password visibility states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validation states
  const [errors, setErrors] = useState({
    current: "",
    newPass: "",
    confirm: ""
  });

  const validateForm = () => {
    const newErrors = {
      current: "",
      newPass: "",
      confirm: ""
    };

    // Current password validation
    if (!current.trim()) {
      newErrors.current = "Current password is required";
    }

    // New password validation
    if (!newPass.trim()) {
      newErrors.newPass = "New password is required";
    } else if (newPass.length < 8) {
      newErrors.newPass = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])/.test(newPass)) {
      newErrors.newPass = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(newPass)) {
      newErrors.newPass = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(newPass)) {
      newErrors.newPass = "Password must contain at least one number";
    } else if (!/(?=.*[@$!%*?&])/.test(newPass)) {
      newErrors.newPass = "Password must contain at least one special character (@$!%*?&)";
    }

    // Confirm password validation
    if (!confirm.trim()) {
      newErrors.confirm = "Please confirm your new password";
    } else if (newPass !== confirm) {
      newErrors.confirm = "Passwords do not match";
    }

    // Check if new password is same as current
    if (current === newPass && current.trim() !== "") {
      newErrors.newPass = "New password must be different from current password";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setMessage("");
    
    try {
      await api.post("/api/auth/change-password", {
        oldPassword: current,
        newPassword: newPass
      });
      
      setMessage("Password changed successfully!");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
      
      // Clear form
      setCurrent("");
      setNewPass("");
      setConfirm("");
      setErrors({ current: "", newPass: "", confirm: "" });
      
    } catch (error: any) {
      if (error.response?.status === 400) {
        setMessage("Invalid current password. Please check and try again.");
      } else if (error.response?.status === 401) {
        setMessage("Unauthorized. Please login again.");
      } else {
        setMessage("Error changing password. Please try again.");
      }
      setMessageType("error");
    }
    
    setSaving(false);
  };

  const clearError = (field: keyof typeof errors) => {
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Password</h1>
      </div>
      <div className="bg-white rounded-lg shadow p-8 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="font-semibold mb-1 block">Current password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                className={`w-full border rounded px-3 py-2 pr-10 ${errors.current ? "border-red-500" : "border-gray-300"}`}
                value={current}
                onChange={e => {
                  setCurrent(e.target.value);
                  clearError("current");
                }}
                placeholder="Current password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.current && <p className="text-red-500 text-sm mt-1">{errors.current}</p>}
          </div>
          
          <div>
            <label className="font-semibold mb-1 block">New password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                className={`w-full border rounded px-3 py-2 pr-10 ${errors.newPass ? "border-red-500" : "border-gray-300"}`}
                value={newPass}
                onChange={e => {
                  setNewPass(e.target.value);
                  clearError("newPass");
                }}
                placeholder="New password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPass && <p className="text-red-500 text-sm mt-1">{errors.newPass}</p>}
          </div>
          
          <div>
            <label className="font-semibold mb-1 block">Confirm new password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className={`w-full border rounded px-3 py-2 pr-10 ${errors.confirm ? "border-red-500" : "border-gray-300"}`}
                value={confirm}
                onChange={e => {
                  setConfirm(e.target.value);
                  clearError("confirm");
                }}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirm && <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>}
          </div>
        </div>
        
        <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
          <p className="font-medium mb-2">Password requirements:</p>
          <ul className="space-y-1">
            <li>• At least 8 characters long</li>
            <li>• Contains at least one lowercase letter</li>
            <li>• Contains at least one uppercase letter</li>
            <li>• Contains at least one number</li>
            <li>• Contains at least one special character (@$!%*?&)</li>
          </ul>
        </div>
        
        <div className="flex justify-between items-center">
          <a href="/forgot-password" className="text-sm text-gray-500 hover:underline">Forgot password?</a>
          <button
            className="px-6 py-2 bg-black text-white rounded disabled:opacity-50 hover:bg-gray-800 transition-colors"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        
        {message && (
          <div className={`mt-4 p-3 rounded text-sm ${
            messageType === "success" 
              ? "bg-green-100 text-green-700 border border-green-200" 
              : "bg-red-100 text-red-700 border border-red-200"
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
} 