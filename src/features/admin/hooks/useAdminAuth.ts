import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

export function useAdminAuth() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<'viewer' | 'operator' | 'super_admin' | null>(null); // Typed Role
  const navigate = useNavigate();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error || !data) throw new Error('Not an admin');

      setIsAdmin(true);
      setRole(data.role); // Store the role
    } catch (error) {
      console.error('Admin Access Denied', error);
      navigate('/'); // Redirect home or login
    } finally {
      setLoading(false);
    }
  };

  return { loading, isAdmin, role };
}