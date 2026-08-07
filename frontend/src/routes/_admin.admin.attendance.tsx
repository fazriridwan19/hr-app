import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const AttendanceMonitoringPage = lazy(
  () => import("@/pages/AttendanceMonitoringPage"),
);

export const Route = createFileRoute("/_admin/admin/attendance")({
  component: AttendanceMonitoringPage,
});
