import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const EmployeeManagementPage = lazy(
  () => import("@/pages/EmployeeManagementPage"),
);

export const Route = createFileRoute("/_admin/admin/employees")({
  component: EmployeeManagementPage,
});
