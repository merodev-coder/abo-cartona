'use client';

import { useEffect } from 'react';
import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  useEffect(() => {
    // Check if admin is authenticated via localStorage
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated');

    if (!isAuthenticated || isAuthenticated !== 'true') {
      // Redirect to login if not authenticated
      window.location.href = '/admin/login';
      return;
    }
  }, []);

  // Render dashboard only if authenticated (client-side check will handle redirect)
  return <AdminDashboard />;
}
