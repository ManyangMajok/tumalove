import { Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CheckEmail() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center p-6 text-center">
      <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Mail className="w-10 h-10 text-yellow-700" />
      </div>
      
      <h1 className="text-3xl font-black text-gray-900 mb-4">Check your inbox</h1>
      <p className="text-gray-600 max-w-md mb-8 text-lg">
        We've sent a secure link to your email. Click it to verify your account and activate your Creator Page.
      </p>

      <div className="bg-white p-4 rounded-xl border border-gray-200 text-sm text-gray-500 max-w-sm">
        <span className="font-bold text-gray-900">Can't see it?</span> Check your spam folder or wait 2 minutes. The subject line is "Confirm your signup".
      </div>

      <Link to="/login" className="mt-8 font-bold text-shikilia-green hover:underline">
        Back to Login
      </Link>
    </div>
  )
}