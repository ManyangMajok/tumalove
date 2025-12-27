import { ArrowRight, Smartphone, Zap, ShieldCheck, Smile, MessageCircle, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] font-sans text-gray-900 overflow-x-hidden selection:bg-emerald-500 selection:text-white flex flex-col">
      
      {/* --- NAVIGATION --- */}
      <nav className="sticky top-0 z-50 bg-[#FAFAF9]/80 backdrop-blur-md border-b border-transparent transition-all duration-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center w-full">
            <div className="text-2xl font-black tracking-tighter flex items-center gap-1">
            Tumalove<span className="text-emerald-600">.</span>
            </div>
            <div className="flex items-center gap-6">
            <Link to="/login" className="hidden md:block font-medium text-gray-600 hover:text-black transition-colors">
                Log in
            </Link>
            <Link to="/signup" className="px-5 py-2.5 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Start my Page
            </Link>
            </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="max-w-4xl mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24 text-center">
        
        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-8 border border-yellow-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Zap className="w-3 h-3 fill-current" />
          Support culture, not charity
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-gray-900 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Give your fans a way to say <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            "Asante" with M-Pesa.
          </span>
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          The simplest way for <span className="font-semibold text-gray-900">Podcasters, Artists, Writers & Devs</span> to receive direct support. No complex forms. No begging. Just value for value.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link to="/signup" className="w-full md:w-auto px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-emerald-600/20 hover:shadow-2xl hover:bg-emerald-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group">
              Create my Page
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/@njoroge" className="w-full md:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2">
              See a live example
            </Link>
        </div>

        <div className="mt-8 text-sm text-gray-400 font-medium animate-in fade-in duration-1000 delay-500">
          Takes 2 minutes to setup · Withdrawals processed within 24hrs
        </div>
      </header>

      {/* --- HOW IT WORKS --- */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900">How Tumalove works</h2>
            <p className="text-gray-500">Simple as 1-2-3.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center group hover:border-emerald-200 transition-colors">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-gray-900 font-bold text-xl border border-gray-100 group-hover:scale-110 transition-transform">1</div>
              <h3 className="font-bold text-lg mb-2">Claim your link</h3>
              <p className="text-gray-500 text-sm">Create your page (tumalove.com/you). Add a bio and set your coffee price.</p>
            </div>
            <div className="relative p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center group hover:border-emerald-200 transition-colors">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-gray-900 font-bold text-xl border border-gray-100 group-hover:scale-110 transition-transform">2</div>
              <h3 className="font-bold text-lg mb-2">Share with fans</h3>
              <p className="text-gray-500 text-sm">Paste your link on Twitter, Instagram bio, or YouTube description.</p>
            </div>
            <div className="relative p-6 rounded-2xl bg-yellow-50 border border-yellow-100 text-center transform hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-yellow-400 rounded-full shadow-lg shadow-yellow-200 flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">3</div>
              <h3 className="font-bold text-lg mb-2">Get Paid</h3>
              <p className="text-gray-600 text-sm">Fans pay via M-Pesa. Withdrawals processed to your phone within 24 hours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- THE FEEDBACK EXPERIENCE (Bubbly Section) --- */}
      <section className="py-24 bg-slate-900 overflow-hidden relative">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse transform -translate-x-1/2 -translate-y-1/2" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-6 border border-white/20 backdrop-blur-sm">
                    <MessageCircle className="w-3 h-3 fill-current" />
                    Real Connection
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Read the love, not just the receipt.</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Every M-Pesa notification comes with a personal message. It’s the energy boost you need to keep creating.
                </p>
            </div>

            {/* The Bubbly Feed Visualization */}
            <div className="relative h-[450px] md:h-[500px] w-full max-w-4xl mx-auto">
                
                {/* Message Bubble 1 (Left) */}
                <div className="absolute top-0 left-0 md:left-10 w-72 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl rounded-bl-none shadow-xl transform rotate-3 hover:scale-105 hover:rotate-0 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-inner"></div>
                             <span className="text-white font-bold text-sm">Maina</span>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-full font-mono">+ KES 100</span>
                    </div>
                    <p className="text-white/90 text-sm font-medium leading-relaxed">"Your latest thread on React was fire! 🔥 Saved me hours of debugging."</p>
                </div>

                {/* Message Bubble 2 (Right - Higher) */}
                <div className="absolute top-24 md:top-20 right-0 md:right-20 w-80 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl rounded-br-none shadow-xl transform -rotate-2 hover:scale-105 hover:rotate-0 transition-all duration-300 z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-inner"></div>
                             <span className="text-white font-bold text-sm">Sarah_Ke</span>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-full font-mono">+ KES 500</span>
                    </div>
                    <p className="text-white/90 text-sm font-medium leading-relaxed">"Buying you lunch for that open source contribution. We need more docs like that!"</p>
                    <div className="absolute -bottom-3 -right-2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg rotate-3">☕ x 10</div>
                </div>

                {/* Message Bubble 3 (Center - Low) */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-72 bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-400/30 p-5 rounded-3xl rounded-t-none shadow-2xl hover:scale-105 transition-all duration-300 z-20">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-white/20"></div>
                             <span className="text-white font-bold text-sm">Anonymous</span>
                        </div>
                        <span className="bg-black/20 text-white text-xs px-2 py-1 rounded-full font-mono">+ KES 50</span>
                    </div>
                    <p className="text-white text-sm font-bold">"Keep going. You inspire me."</p>
                    <div className="flex justify-end mt-2">
                        <Heart className="w-4 h-4 text-white fill-white animate-pulse" />
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* --- WALL OF LOVE (Scattered Sticky Notes) --- */}
      <section className="py-24 overflow-hidden bg-[#FAFAF9]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Loved by Kenyan Creators</h2>
            <p className="text-gray-500">Join 500+ creatives holding it down.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12 relative pb-10">
            {/* Note 1 - Yellow - Rotated Left */}
            <div className="w-full sm:w-64 transform -rotate-1 sm:-rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300 z-10">
               <div className="relative bg-yellow-50 p-6 shadow-md border border-yellow-200/50 h-full">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-yellow-200/50 rotate-1 backdrop-blur-sm"></div>
                  <p className="text-gray-800 font-handwriting text-sm mb-4 leading-relaxed">
                    "I used to struggle with PayPal. Tumalove changed the game. No stress."
                  </p>
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center text-xs font-bold text-yellow-800">N</div>
                    <div><div className="font-bold text-xs">Njoroge</div><div className="text-gray-400 text-[10px] uppercase">Producer</div></div>
                  </div>
               </div>
            </div>

            {/* Note 2 - Blue - Rotated Right - Pushed Down */}
            <div className="w-full sm:w-64 transform rotate-1 sm:rotate-3 sm:mt-12 hover:rotate-0 hover:scale-105 transition-all duration-300 z-0">
               <div className="relative bg-blue-50 p-6 shadow-md border border-blue-100 h-full">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-blue-200/50 -rotate-2 backdrop-blur-sm"></div>
                  <p className="text-gray-800 font-handwriting text-sm mb-4 leading-relaxed">
                    "Finally, a way to monetize my tech threads without sharing my phone number."
                  </p>
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-800">A</div>
                    <div><div className="font-bold text-xs">Amina</div><div className="text-gray-400 text-[10px] uppercase">Tech Blogger</div></div>
                  </div>
               </div>
            </div>

            {/* Note 3 - Rose - Straight - Pushed Up */}
            <div className="w-full sm:w-64 transform -rotate-1 sm:-mt-8 hover:rotate-0 hover:scale-105 transition-all duration-300 z-10">
               <div className="relative bg-rose-50 p-6 shadow-md border border-rose-100 h-full">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-rose-200/50 rotate-1 backdrop-blur-sm"></div>
                  <p className="text-gray-800 font-handwriting text-sm mb-4 leading-relaxed">
                    "Bought my new podcast mic entirely from Tumalove support. 'Buy me a Samosa' is a hit!"
                  </p>
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center text-xs font-bold text-rose-800">K</div>
                    <div><div className="font-bold text-xs">Kevin</div><div className="text-gray-400 text-[10px] uppercase">Podcaster</div></div>
                  </div>
               </div>
            </div>

            {/* Note 4 - Purple - Heavy Rotate Left */}
            <div className="w-full sm:w-64 transform -rotate-2 sm:-rotate-6 sm:mt-0 hover:rotate-0 hover:scale-105 transition-all duration-300 z-0">
               <div className="relative bg-purple-50 p-6 shadow-md border border-purple-100 h-full">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-purple-200/50 -rotate-1 backdrop-blur-sm"></div>
                  <p className="text-gray-800 font-handwriting text-sm mb-4 leading-relaxed">
                    "My digital art commissions are way easier to manage now. The privacy is key."
                  </p>
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-xs font-bold text-purple-800">W</div>
                    <div><div className="font-bold text-xs">Wanjiku</div><div className="text-gray-400 text-[10px] uppercase">Artist</div></div>
                  </div>
               </div>
            </div>

            {/* Note 5 - Green - Rotated Right - Pushed Down */}
            <div className="w-full sm:w-64 transform rotate-1 sm:rotate-2 sm:mt-16 hover:rotate-0 hover:scale-105 transition-all duration-300 z-10">
               <div className="relative bg-green-50 p-6 shadow-md border border-green-100 h-full">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-green-200/50 rotate-2 backdrop-blur-sm"></div>
                  <p className="text-gray-800 font-handwriting text-sm mb-4 leading-relaxed">
                    "I maintain 3 open source repos. The coffee money actually pays for my internet now."
                  </p>
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-800">B</div>
                    <div><div className="font-bold text-xs">Brian</div><div className="text-gray-400 text-[10px] uppercase">Developer</div></div>
                  </div>
               </div>
            </div>

            {/* Note 6 - Orange - Straight-ish - Pushed Up */}
            <div className="w-full sm:w-64 transform rotate-1 sm:-mt-6 hover:rotate-0 hover:scale-105 transition-all duration-300 z-0">
               <div className="relative bg-orange-50 p-6 shadow-md border border-orange-100 h-full">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-orange-200/50 -rotate-1 backdrop-blur-sm"></div>
                  <p className="text-gray-800 font-handwriting text-sm mb-4 leading-relaxed">
                    "Super simple for my TikTok followers. They just click the link in bio and boom."
                  </p>
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-xs font-bold text-orange-800">S</div>
                    <div><div className="font-bold text-xs">Stacy</div><div className="text-gray-400 text-[10px] uppercase">Content</div></div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-12 pb-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold mb-2">M-Pesa Native</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We don't do cards. We do M-Pesa. STK Push makes supporting you feel as casual as buying credit.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-700 mb-4">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold mb-2">Your Data, Your Money</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                You own the relationship. Download your supporter list anytime. Transparent fees.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-700 mb-4">
                <Smile className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold mb-2">More than money</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Allow fans to send a message with their support. It’s the energy boost you need to keep creating.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-emerald-600 py-12 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6">
            <div className="text-2xl font-black tracking-tighter flex items-center gap-1 text-white">
              Tumalove<span className="text-yellow-400">.</span>
            </div>
            
            <p className="text-emerald-100 font-medium opacity-80">
              Built in Kenya 🇰🇪, for Kenyan creatives.
            </p>
            
            <div className="flex gap-8 text-sm text-emerald-100/60 font-medium">
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                <a href="#" className="hover:text-white transition-colors">Instagram</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
        </div>
      </footer>
    </div>
  )
}