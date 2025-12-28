import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

export default function AdminAutoLogout() {
  const navigate = useNavigate();
  const TIMEOUT_MS = 30 * 60 * 1000; // 30 Minutes

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        // Only logout if we are actually in the admin portal
        if (window.location.pathname.includes('/portal-x99')) {
          console.warn("Session expired due to inactivity");
          await supabase.auth.signOut();
          navigate('/portal-x99/login');
        }
      }, TIMEOUT_MS);
    };

    // Listen for activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer(); // Start

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [navigate]);

  return null; // Invisible component
}