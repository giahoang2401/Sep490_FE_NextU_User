import PackageHistory from '@/components/user/PackageHistory';

export default function MyBookingsPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8 text-center">My Bookings</h1>
      <p className="text-center text-slate-600 mb-8">Manage all your package requests, payments, and statuses here.</p>
      <PackageHistory />
    </div>
  );
} 