import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const AttendancePage = lazy(() => import("@/pages/AttendancePage"));

export const Route = createFileRoute("/_auth/attendance")({
  component: AttendancePage,
});
