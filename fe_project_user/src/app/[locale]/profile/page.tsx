"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Package } from "lucide-react"
import ProfileInfo from "@/components/user/ProfileInfo"
import PackageList from "@/components/user/PackageList"

export default function ProfilePage() {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">My Profile</h1>
          <p className="text-lg text-slate-600">Manage your account and package subscriptions</p>
        </div>

        {/* Tab Section */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-white/50 backdrop-blur-sm p-2 mb-8">
            <TabsTrigger value="profile" className="rounded-xl">
              <User className="h-4 w-4 mr-2" />
              Profile Information
            </TabsTrigger>
            <TabsTrigger value="packages" className="rounded-xl">
              <Package className="h-4 w-4 mr-2" />
              My Packages
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="profile">
            <ProfileInfo />
          </TabsContent>

          <TabsContent value="packages">
            <PackageList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
