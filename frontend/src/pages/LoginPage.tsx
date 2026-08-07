import { LoginForm } from "@/features/auth/components/LoginForm";
import React from "react";

const LoginPage: React.FC = () => (
  <div
    className="relative flex min-h-screen items-center justify-center px-4 py-16 transition-colors duration-200"
    style={{ background: "var(--bg-app)" }}
  >
    {/* Theme toggle */}
    {/* <div className="absolute right-5 top-5">
      <ThemeToggle />
    </div> */}

    <div className="w-full max-w-[400px] animate-slide-up">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 text-white text-base font-bold shadow-sm">
          HR
        </div>
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-heading)" }}
          >
            HR System
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Masuk untuk melanjutkan
          </p>
        </div>
      </div>

      {/* Card */}
      <div
        className="rounded-lg bg-white dark:bg-[var(--bg-surface)] p-6 shadow-sm"
        style={{ border: "1px solid var(--border)" }}
      >
        <LoginForm />
      </div>

      {/* Footer */}
      <p
        className="mt-6 text-center text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        &copy; {new Date().getFullYear()} Dexa Group &middot; Hubungi admin jika
        butuh bantuan
      </p>
    </div>
  </div>
);

export default LoginPage;
