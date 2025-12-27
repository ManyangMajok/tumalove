import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Shield, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminAuth({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { 
    checkAdminAccess() 
  }, [])

  const checkAdminAccess = async () => {
    try {
      // 1. Check Session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('No session found, redirecting to login')
        navigate('/admin/login')
        return
      }

      console.log('Session found, user ID:', session.user.id)

      // 2. Use the database function to check admin status
      const { data: adminCheck, error: adminError } = await supabase
        .rpc('is_user_admin', { user_uuid: session.user.id })

      if (adminError) {
        console.error('Error checking admin status:', adminError)
        throw adminError
      }

      if (!adminCheck) {
        console.log('User is not an admin')
        navigate('/admin/login')
        return
      }

      console.log('User is admin, granting access')
      setAuthenticated(true)
      
    } catch (error: any) {
      console.error('Admin access check failed:', error)
      navigate('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-shikilia-green animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin permissions...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null // Will be redirected by useEffect
  }

  return <>{children}</>
}