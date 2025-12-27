import { useState } from 'react';
import { LogOut, Settings as SettingsIcon, Menu, X, BadgeCheck, Clock, List, LayoutDashboard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import type { Profile } from '../../types/dashboard';

interface HeaderProps {
  profile: Profile | null;
  onCopyLink: () => void;
}

export default function DashboardHeader({ profile, onCopyLink }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path ? "text-emerald-600 bg-emerald-50" : "text-gray-600 hover:text-black hover:bg-gray-50";

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
            {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar"/> : "🦁"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-gray-900 leading-tight">@{profile?.username}</h1>
              {profile?.verification_status === 'verified' && <BadgeCheck className="w-4 h-4 fill-blue-500 text-white" />}
              {profile?.verification_status === 'pending' && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded-full">
                  <Clock className="w-3 h-3 text-blue-600" />
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Pending</span>
                </div>
              )}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">Tumalove Creator</div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <button onClick={() => navigate('/dashboard')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${isActive('/dashboard')}`}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button onClick={() => navigate('/transactions')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${isActive('/transactions')}`}>
            <List className="w-4 h-4" /> Transactions
          </button>
          <div className="h-4 w-px bg-gray-200 mx-2"></div>
          <button onClick={() => navigate('/settings')} className="text-sm font-medium text-gray-600 hover:text-black flex items-center gap-2 px-2">
            <SettingsIcon className="w-4 h-4" /> Edit
          </button>
          <button onClick={onCopyLink} className="text-sm font-medium text-gray-600 hover:text-black px-2">Share</button>
          <button onClick={handleLogout} className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200 ml-2">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600">
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 p-4 bg-white flex flex-col gap-2 shadow-xl absolute w-full left-0 animate-in slide-in-from-top-2">
            <button onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 text-left font-medium rounded-xl hover:bg-gray-50">
              <LayoutDashboard className="w-5 h-5 text-gray-500" /> Dashboard
            </button>
            <button onClick={() => { navigate('/transactions'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 text-left font-medium rounded-xl hover:bg-gray-50">
              <List className="w-5 h-5 text-gray-500" /> Transactions
            </button>
            <div className="h-px bg-gray-100 my-1"></div>
            <button onClick={() => navigate('/settings')} className="p-3 text-left font-medium text-gray-600">Edit Profile</button>
            <button onClick={onCopyLink} className="p-3 text-left font-medium text-gray-600">Share Page</button>
            <button onClick={handleLogout} className="p-3 text-left font-medium text-red-600">Log Out</button>
        </div>
      )}
    </header>
  );
}