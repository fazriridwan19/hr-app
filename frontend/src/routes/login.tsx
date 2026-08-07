import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy } from "react";
import { useAuthStore } from "@/store/auth.store";

const LoginPage = lazy(() => import("@/pages/LoginPage"));

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({ to: "/attendance" });
    }
  },
  component: LoginPage,
});
