import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";
import { MainLayout } from "@/layouts/MainLayout";

export const Route = createFileRoute("/_admin")({
  beforeLoad: () => {
    const { user, isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }
    if (user?.role !== "ADMIN") {
      throw redirect({ to: "/attendance" });
    }
  },
  component: MainLayout,
});
