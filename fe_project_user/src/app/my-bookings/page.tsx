import PackageHistory from '@/components/user/PackageHistory';

export default function MyBookingsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-2 py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8 text-center">My Bookings</h1>
      <p className="text-center text-slate-600 mb-8">Manage all your package requests, payments, and statuses here.</p>
      <PackageHistory />
    </div>
  );
} 