import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0d12]">
      <div className="text-center">
        <div className="text-6xl font-bold text-zinc-700 mb-4">404</div>
        <h2 className="text-xl font-bold text-zinc-100 mb-2">Page not found</h2>
        <p className="text-zinc-400 text-sm mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/dashboard" className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm">Back to dashboard</Link>
      </div>
    </div>
  );
}
