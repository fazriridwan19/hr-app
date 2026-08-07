import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { AttendanceTable } from '@/features/attendance/components/AttendanceTable';
import { AttendanceFilters, type AttendanceFilterValues } from '@/features/attendance/components/AttendanceFilters';
import { useAllAttendances } from '@/features/attendance/hooks/useAttendances';
import type { AttendanceStatus } from '@/types/attendance.types';

const defaultFilters: AttendanceFilterValues = { date: '', employeeId: '', status: '' };

const AttendanceMonitoringPage: React.FC = () => {
  const [page, setPage]       = useState(1);
  const [filters, setFilters] = useState<AttendanceFilterValues>(defaultFilters);

  const { data, isLoading } = useAllAttendances({
    page, limit: 15,
    date:       filters.date       || undefined,
    employeeId: filters.employeeId ? Number(filters.employeeId) : undefined,
    status:     (filters.status as AttendanceStatus) || undefined,
  });

  const onFilterChange = (v: AttendanceFilterValues) => { setFilters(v); setPage(1); };
  const onReset        = () => { setFilters(defaultFilters); setPage(1); };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
          Monitoring Absensi
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          {data ? `${data.meta.totalData} total record ditemukan` : 'Memuat data…'}
        </p>
      </div>

      <Card noPadding>
        {/* Filter bar */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <AttendanceFilters values={filters} onChange={onFilterChange} onReset={onReset} />
        </div>
        <AttendanceTable data={data} loading={isLoading} page={page} onPageChange={setPage} showEmployee />
      </Card>
    </div>
  );
};

export default AttendanceMonitoringPage;
