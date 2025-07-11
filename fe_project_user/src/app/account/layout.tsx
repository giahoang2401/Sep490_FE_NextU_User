"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountContext } from "@/components/account/AccountContext";
import { useEffect, useState } from "react";
import api from "@/utils/axiosConfig";

const sidebarItems = [
  { name: "About me", href: "/account/about-me" },
  { name: "Photo & Description", href: "/account/photo-description" },
  { name: "Interests", href: "/account/interests" },

  { name: "Profession & Skills", href: "/account/profession-skills" },
  { divider: true },

  { name: "Password", href: "/account/password" },

  { name: "Delete account", href: "/account/delete-account" },

];

function getCurrentPageName(pathname: string) {
  const item = sidebarItems.find(i => i.href === pathname);
  return item?.name || "";
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const [accountData, setAccountData] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    api.get("/api/user/profiles/profileme").then(res => setAccountData(res.data || res));
  }, []);

  if (!accountData) return <div className="p-8">Loading...</div>;

  const currentPage = getCurrentPageName(pathname);

  return (
    <AccountContext.Provider value={accountData}>
      {/* Navbar phụ: breadcrumb + view profile */}
      <div className="w-full border-b bg-white px-12 py-4 flex items-center justify-between sticky top-0 z-10">
        <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex items-center gap-1">
            <li className="flex items-center">
              <Link href="/" className="hover:underline">Home</Link>
              <span className="mx-2">&gt;</span>
            </li>
            <li className="flex items-center">
              <Link href="/account" className="hover:underline">Account</Link>
              <span className="mx-2">&gt;</span>
            </li>
            <li className="flex items-center font-semibold text-black">{currentPage}</li>
          </ol>
        </nav>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">Profile score:</span>
          <span className="font-bold text-lg">{accountData.profileScore ?? 53}</span>
          <span className="text-gray-600">/ 100%</span>
          <Link href="/account/my-profile" className="px-3 py-1 border rounded text-sm hover:bg-gray-100">View profile</Link>
        </div>
      </div>
      {/* Main content: sidebar + page content */}
      <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">
        <aside className="w-1/3 max-w-sm bg-white border-r pl-12 pr-4 pt-8 flex-shrink-0">
          <nav className="space-y-1">
            {sidebarItems.map((item, idx) =>
              item.divider ? (
                <hr className="my-3" key={idx} />
              ) : item.href ? (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-2 py-2 rounded-md text-base font-medium ${
                    pathname === item.href
                      ? "bg-gray-100 font-semibold text-black"
                      : "text-gray-700 hover:bg-gray-50 hover:text-black"
                  }`}
                >
                  {item.name}
                </Link>
              ) : null
            )}
          </nav>
        </aside>
        <main className="flex-1 pt-12 pr-0 pl-8 pb-12 flex">
          <div className="flex-1 max-w-none">{children}</div>
        </main>
      </div>
    </AccountContext.Provider>
  );
} 