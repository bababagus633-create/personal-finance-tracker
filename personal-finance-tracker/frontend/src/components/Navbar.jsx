import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0f0a1e]/80 border-b border-white/10">
      <div className="container mx-auto px-4 h-16 max-w-6xl flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-400 group-hover:to-purple-400 transition-all">
            FinanceTrack
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link 
            to="/" 
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              isActive('/') 
                ? 'bg-white/10 text-brand-300 border border-white/10' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/admin" 
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              isActive('/admin') 
                ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </nav>
  );
}
