'use client';
import ProfileInfo from '@/components/user/ProfileInfo';

export default function MyProfilePage() {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 lg:px-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6 text-center">My Profile</h1>
        <ProfileInfo />
      </div>
    </div>
  );
} 