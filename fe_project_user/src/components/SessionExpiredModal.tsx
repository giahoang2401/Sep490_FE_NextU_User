"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/components/auth-context";
import { useRouter } from "next/navigation";
import { useSessionExpired, setGlobalSessionExpiredHandler } from "@/context/SessionExpiredContext";

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SessionExpiredModalComponent({ isOpen, onClose }: SessionExpiredModalProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLoginRedirect = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onClose();
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Auto-logout after 10 seconds if user doesn't click
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        handleLoginRedirect();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Session Expired
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Your login session has expired
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-700">
            Your session has expired due to inactivity. Please log in again to continue using the application.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            You will be automatically redirected to the login page in 10 seconds.
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={handleLoginRedirect}
            disabled={isLoggingOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoggingOut ? "Logging out..." : "Login Again"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main wrapper component that connects to context
export function SessionExpiredModal() {
  const { isSessionExpired, showSessionExpired, hideSessionExpired } = useSessionExpired();

  // Set up global handler when component mounts
  useEffect(() => {
    setGlobalSessionExpiredHandler(showSessionExpired);
  }, [showSessionExpired]);

  return (
    <SessionExpiredModalComponent 
      isOpen={isSessionExpired} 
      onClose={hideSessionExpired} 
    />
  );
}
