import React from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { Link } from '@tanstack/react-router';

const ForgotPasswordPage: React.FC = () => (
  <div
    className="relative flex min-h-screen items-center justify-center px-4 py-16 transition-colors duration-200"
    style={{ background: 'var(--bg-app)' }}
  >
    <div className="absolute right-5 top-5">
      <ThemeToggle />
    </div>

    <div className="w-full max-w-[440px] animate-slide-up">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 text-white text-base font-bold shadow-sm">
          HR
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
            Lupa Kata Sandi
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Masukkan alamat email Anda untuk menerima tautan reset.
          </p>
        </div>
      </div>

      <div
        className="rounded-lg bg-white dark:bg-[var(--bg-surface)] p-6 shadow-sm"
        style={{ border: '1px solid var(--border)' }}
      >
        <ForgotPasswordForm />
      </div>

      <div className="mt-5 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  </div>
);

export default ForgotPasswordPage;
