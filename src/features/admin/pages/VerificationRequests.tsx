import { useState } from 'react'
import { supabase } from '../../../supabaseClient'

import { useRealtimeQuery } from '../../../hooks/useRealtimeQuery'
import {
  Check,
  X,
  ExternalLink,
  Instagram,
  Twitter,
  Globe,
  Clock,
  BadgeCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react'

interface Profile {
  id: string
  username: string
  verification_status: 'unverified' | 'pending' | 'verified'
  social_links: {
    platform: string
    url: string
  }[]
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export default function VerificationRequests() {

  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'unverified'>('pending')

  /* 🔥 Cached + Realtime Query (per-tab cache) */
  const { data: profiles = [], isLoading } = useRealtimeQuery(
    ['verifications', activeTab],
    'profiles',
    async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (activeTab === 'pending') query = query.eq('verification_status', 'pending')
      else if (activeTab === 'verified') query = query.eq('verification_status', 'verified')
      else query = query.eq('verification_status', 'unverified')

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    }
  )

  /* Actions */
  const handleVerdict = async (
    id: string,
    verdict: 'verified' | 'unverified' | 'pending'
  ) => {
    if (!confirm(`Mark this user as ${verdict.toUpperCase()}?`)) return

    const { error } = await supabase
      .from('profiles')
      .update({ verification_status: verdict })
      .eq('id', id)

    if (error) {
      alert('Error updating status')
    }
  }



  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Verifications
          </h1>
          <p className="text-slate-500 mt-1">
            Vet creators before they go public.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex flex-wrap shadow-sm">
          {(['pending', 'verified', 'unverified'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${
                activeTab === tab
                  ? tab === 'pending'
                    ? 'bg-orange-50 text-orange-700 shadow-sm'
                    : tab === 'verified'
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'bg-slate-100 text-slate-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab === 'pending'
                ? 'Pending Requests'
                : tab === 'verified'
                ? 'Verified List'
                : 'Stuck / Unverified'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin mb-2 opacity-20" />
            <p>Loading profiles...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <BadgeCheck size={32} />
            </div>
            <p>No {activeTab} profiles found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {profiles.map((profile: Profile) => (
              <div
                key={profile.id}
                className="p-6 flex flex-col md:flex-row items-start gap-6 hover:bg-slate-50 transition-colors"
              >
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">
                      {profile.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="font-bold text-lg text-slate-900">
                      @{profile.username}
                    </h3>

                    {activeTab === 'verified' && (
                      <BadgeCheck size={20} className="text-white fill-[#1DA1F2]" />
                    )}
                  </div>

                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                    {profile.bio || 'No bio provided.'}
                  </p>

                  {/* Social Links */}
                  <div className="flex flex-wrap gap-2">
                    {profile.social_links?.length ? (
                      profile.social_links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200"
                        >
                          {link.platform.includes('instagram') ? (
                            <Instagram size={12} />
                          ) : link.platform.includes('twitter') ? (
                            <Twitter size={12} />
                          ) : (
                            <Globe size={12} />
                          )}
                          {link.platform}
                          <ExternalLink size={10} className="opacity-50" />
                        </a>
                      ))
                    ) : (
                      <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded flex items-center gap-1">
                        <AlertCircle size={10} /> No Social Links
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  {activeTab === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerdict(profile.id, 'unverified')}
                        className="flex-1 px-4 py-2 border rounded-lg text-sm font-bold hover:bg-red-50 hover:text-red-600"
                      >
                        <X size={16} /> Reject
                      </button>
                      <button
                        onClick={() => handleVerdict(profile.id, 'verified')}
                        className="flex-1 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold"
                      >
                        <Check size={16} /> Approve
                      </button>
                    </div>
                  )}

                  {activeTab === 'verified' && (
                    <button
                      onClick={() => handleVerdict(profile.id, 'unverified')}
                      className="text-xs text-red-400 hover:text-red-600 font-medium underline"
                    >
                      Revoke Verification
                    </button>
                  )}

                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock size={10} />
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
