import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ClockInOutCard } from '@/features/attendance/components/ClockInOutCard';
import { AttendanceTable } from '@/features/attendance/components/AttendanceTable';
import { useMyAttendances } from '@/features/attendance/hooks/useAttendances';
import { useAuth } from '@/hooks/useAuth';
import { getGreeting } from '@/lib/utils';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMyAttendances({ page, limit: 10 });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {getGreeting()}, {user?.name} 👋
        </h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Clock In/Out */}
      <ClockInOutCard />

      {/* Riwayat Absensi */}
      <Card title="Riwayat Absensi">
        <AttendanceTable
          data={data}
          loading={isLoading}
          page={page}
          onPageChange={setPage}
          showEmployee={false}
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
