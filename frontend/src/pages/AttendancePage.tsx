import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { ClockInOutCard } from "@/features/attendance/components/ClockInOutCard";
import { AttendanceTable } from "@/features/attendance/components/AttendanceTable";
import { useMyAttendances } from "@/features/attendance/hooks/useAttendances";
import { useAuth } from "@/hooks/useAuth";
import { getGreeting } from "@/lib/utils";

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyAttendances({ page, limit: 10 });

  return (
    <div className="w-full">
      {/* Content */}
      <div className="mx-auto mt-6 w-full max-w-4xl">
        {/* Page header */}
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-heading)" }}
        >
          {getGreeting()}, {user?.name}
        </h1>

        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        {/* Clock in/out */}
        <ClockInOutCard />

        {/* History */}
        <div className="mt-6">
          <Card
            title="Riwayat Absensi"
            description="Rekap absensi pribadi Anda"
            noPadding
          >
            <AttendanceTable
              data={data}
              loading={isLoading}
              page={page}
              onPageChange={setPage}
              showEmployee={false}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
