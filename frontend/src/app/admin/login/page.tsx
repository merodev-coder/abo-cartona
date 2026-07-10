'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Read credentials from .env file
    const validUser = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const validPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (username === validUser && password === validPass) {
      // Save authentication state to localStorage
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('token', 'bypass-token-for-admin');

      // Instant hard redirect to admin dashboard
      window.location.href = '/admin';
    } else {
      setError('بيانات الدخول غير صحيحة');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col" dir="rtl">
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full"
        >
          <div className="bg-surface-secondary rounded-2xl p-8 border border-border shadow-elevated relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-brand" />

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-brand-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <p className="section-label mb-0.5">لوحة التحكم</p>
                <h1 className="text-h3 text-text-primary">تسجيل الدخول</h1>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded-xl bg-error-light dark:bg-error/10 border border-error/20 text-body-sm font-medium text-error-dark dark:text-error"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="text-caption font-semibold text-text-secondary mb-1.5 block">
                  اسم المستخدم
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field w-full"
                  placeholder="admin"
                  autoComplete="username"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="text-caption font-semibold text-text-secondary mb-1.5 block">
                  كلمة المرور
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full"
                  placeholder="••••••••"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="btn-primary w-full py-3.5 text-body font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>دخول</span>
                )}
              </motion.button>
            </form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 pt-4 border-t border-border text-center text-caption text-text-muted"
            >
              أبوكرتونةلوحة تحكم المتجر
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
